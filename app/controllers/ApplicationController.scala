package controllers

import javax.inject.Inject

import com.mohiva.play.silhouette.api.actions.SecuredRequest
import com.mohiva.play.silhouette.api.{ LogoutEvent, Silhouette }
import org.webjars.play.WebJarsUtil
import play.api.i18n.I18nSupport
import play.api.mvc.{ AbstractController, AnyContent, ControllerComponents }
import utils.auth.DefaultEnv
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

import scala.concurrent.Future

/**
 * The basic application controller.
 *
 * @param components  The Play controller components.
 * @param silhouette  The Silhouette stack.
 * @param webJarsUtil The webjar util.
 * @param assets      The Play assets finder.
 */
class ApplicationController @Inject() (
  components: ControllerComponents,
  silhouette: Silhouette[DefaultEnv]
)(
  implicit
  webJarsUtil: WebJarsUtil,
  assets: AssetsFinder,
  system: ActorSystem,
  mat: Materializer
) extends AbstractController(components) with I18nSupport {

  val jsonConverter = new FileIO
  var playerCount = 0;
  var searchingPlayers: Vector[(String, ActorRef)] = Vector()
  var currentMatches: Vector[(ActorRef, ActorRef, ChessController)] = Vector()

  /**
   * Handles the index action.
   *
   * @return The result to display.
   */
  def index = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val white_count = searchingPlayers.filter(_._1.equals("white")).size
    val black_count = searchingPlayers.filter(_._1.equals("black")).size
    Future.successful(Ok(views.html.multiplayer(request.identity, white_count, black_count)))
  }

  def singleplayer = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    Future.successful(Ok(views.html.singleplayer(request.identity)))
  }

  def select(y: Int, x: Int, webSocketID: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    var controller = getChesscontroller(webSocketID)
    Future.successful(Ok(views.html.selectableFieldsAjax(controller.chessBoard.board(y)(x).getPossibleMoves(controller.chessBoard))));
  }

  def move(move: String, webSocketID: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    var controller = getChesscontroller(webSocketID)
    var tui = new tui(controller)
    tui.processInputLine(move)
    informPlayers(controller);
    Future.successful(Ok(""))
  }

  def json(webSocketID: String) = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    var controller = getChesscontroller(webSocketID)
    Future.successful(Ok(jsonConverter.gridToJson(controller.chessBoard)))
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

        if (msg.equals("singleplayer")) {
          currentMatches = currentMatches :+ ((out, out, new ChessController))
        }

        if (msg.equals("white")) { //looking for blacks lol
          searchPlayer(msg, "black")
        }
        if (msg.equals("black")) { //looking for whites lol
          searchPlayer(msg, "white")
        }

    }
    def searchPlayer(msg: String, color: String): Unit = {
      var foundPlayer = false;
      for (player <- searchingPlayers) {
        if (player._1.equals(color)) {
          foundPlayer = true;
          println("Player found! ready to pair")
          println(player._2.toString() + " found: " + out.toString())

          if (color.equals("white")) {
            currentMatches = currentMatches :+ ((player._2, out, new ChessController))
          } else {
            currentMatches = currentMatches :+ ((out, player._2, new ChessController))
          }

          player._2 ! "load:" + player._2.toString()
          out ! "load:" + out.toString()
          searchingPlayers = searchingPlayers.filter(_ != player)
        }
      }
      if (!foundPlayer) {
        searchingPlayers = searchingPlayers :+ ((msg, out))
        out ! "wait"
        println("added player to searching players out: " + out.toString())
      }
    }
  }

  def getChesscontroller(webSocketID: String): ChessController = {
    println("ID to be found: " + webSocketID);
    var controller: ChessController = null
    for (chessmatch <- currentMatches) {
      if (chessmatch._1.toString().equals(webSocketID) || chessmatch._2.toString().equals(webSocketID)) {
        controller = chessmatch._3

      }
    }
    controller
  }
  def informPlayers(controller: ChessController): Unit = {
    for (chessmatch <- currentMatches) {
      if (chessmatch._3.equals(controller)) {
        println("Players found! Sending them LOAD-Events")
        chessmatch._1 ! "load:"
        chessmatch._2 ! "load:"
      }
    }
  }

  /**
   * Handles the Sign Out action.
   *
   * @return The result to display.
   */
  def signOut = silhouette.SecuredAction.async { implicit request: SecuredRequest[DefaultEnv, AnyContent] =>
    val result = Redirect(routes.ApplicationController.index())
    silhouette.env.eventBus.publish(LogoutEvent(request.identity, request))
    silhouette.env.authenticatorService.discard(request.authenticator, result)
  }
}
