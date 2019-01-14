package controllers

import javax.inject._
import controller.ChessController
import play.api.mvc._
import akka.actor._
import akka.actor.ActorSystem
import akka.stream.Materializer
import play.api.libs.streams.ActorFlow
import view.tui
import model.fileIOComponent.fileIoJsonImpl
import model.fileIOComponent.fileIoJsonImpl.FileIO
import util.MoveSetUtil

/**
 * This controller creates an `Action` to handle HTTP requests to the
* application's home page.
*/
@Singleton
class MainController @Inject()(cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {
  val jsonConverter = new FileIO
  var playerCount = 0;
  var searchingPlayers: Vector[(String, ActorRef)] = Vector()
  var currentMatches: Vector[(ActorRef, ActorRef, ChessController)] = Vector()


  def index = Action{
    Ok(views.html.welcome())
  }
/*
  def schach = Action {
    Ok(views.html.schach(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer), controller.currentPlayer))
  }
*/
  def select(y: Int,x: Int, webSocketID: String) = Action {
    var controller = getChesscontroller(webSocketID)
    Ok(views.html.selectableFieldsAjax(controller.chessBoard(y)(x).getPossibleMoves(controller.chessBoard)));
  }

  def move(move: String, webSocketID: String) = Action {
    var controller = getChesscontroller(webSocketID)
    var tui = new tui(controller)
    tui.processInputLine(move)
    informPlayers(controller);
    Ok("")
  }

  def json(webSocketID: String) = Action{
    var controller = getChesscontroller(webSocketID)
    Ok(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer))
  }

  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("connect received")
      SchachSocketActor.props(out)

    }
  }
  object SchachSocketActor {
    def props(out: ActorRef) = Props(new SchachSocketActor(out))
  }

  class SchachSocketActor(out: ActorRef) extends Actor {
    def receive = {
      case msg: String =>

        if(msg.equals("white")){ //looking for blacks lol
          searchPlayer(msg, "black")
        }
        if(msg.equals("black")){ //looking for whites lol
          searchPlayer(msg, "white")
        }


        //out.tell("HI", sender())
    }
    def searchPlayer(msg: String, color: String):  Unit ={
      var foundPlayer = false;
      for(player <- searchingPlayers){
        if(player._1.equals(color)){
          foundPlayer = true;
          println("Player found! ready to pair")
          println(player._2.toString() + " found: " + out.toString())

          if(color.equals("white")){
            currentMatches = currentMatches :+ (player._2, out, new ChessController)
          } else {
            currentMatches = currentMatches :+ (out, player._2, new ChessController)
          }

          player._2 ! "load:" + player._2.toString()
          out ! "load:" + out.toString()
          searchingPlayers = searchingPlayers.filter(_ != player)
        }
      }
      if(!foundPlayer){
        searchingPlayers  = searchingPlayers :+ (msg, out)
        out ! "wait"
        println("added player to searching players out: " + out.toString())
      }
    }
  }

  def getChesscontroller(webSocketID: String): ChessController ={
    println("ID to be found: " + webSocketID);
    var controller: ChessController = null
    for(chessmatch <- currentMatches){
      if(chessmatch._1.toString().equals(webSocketID) || chessmatch._2.toString().equals(webSocketID)){
        controller = chessmatch._3

        println("gefundener Chesscontroller:" + controller.boardSize)
      }
    }
    controller
  }
  def informPlayers(controller: ChessController): Unit ={
    for(chessmatch <- currentMatches){
      if(chessmatch._3.equals(controller)){
        println("Players found! Sending them LOAD-Events")
        chessmatch._1 ! "load:"
        chessmatch._2 ! "load:"
      }
    }
  }

}
