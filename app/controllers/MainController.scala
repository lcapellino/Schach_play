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
  val controller = new ChessController
  val tui = new tui(controller)
  val jsonConverter = new FileIO
  var playerCount = 0;
  var searchingPlayers: Vector[(String, ActorRef)] = Vector()
  var currentMatches: Vector[(ActorRef, ActorRef, ChessController)] = Vector()


  def index = Action{
    Ok(views.html.welcome())
  }

  def schach = Action {
    Ok(views.html.schach(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer), controller.currentPlayer))
  }

  def select(y: Int,x: Int) = Action {
    Ok(views.html.selectableFieldsAjax(controller.chessBoard(y)(x).getPossibleMoves(controller.chessBoard)));
  }

  def move(move: String) = Action {
    tui.processInputLine(move)
    Ok(views.html.schach(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer), controller.currentPlayer))
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
      for(colorThatPlayerWants <- searchingPlayers){
        if(colorThatPlayerWants._1.equals(color)){
          foundPlayer = true;
          println("Player found! ready to pair")
          println(colorThatPlayerWants._2.toString() + " found: " + sender().toString())
          currentMatches = currentMatches :+ (colorThatPlayerWants._2, out, new ChessController)
          colorThatPlayerWants._2 ! "someone found you:"
        }
      }
      if(!foundPlayer){
        searchingPlayers  = searchingPlayers :+ (msg, out)
        out ! "wait"
        println("added player to searching players out: " + out.toString())
      }
    }
  }
}
