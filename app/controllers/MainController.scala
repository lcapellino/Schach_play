package controllers

import javax.inject._
import controller.ChessController
import play.api.mvc._
import view.tui
import model.fileIOComponent.fileIoJsonImpl
import model.fileIOComponent.fileIoJsonImpl.FileIO
import util.MoveSetUtil

/**
 * This controller creates an `Action` to handle HTTP requests to the
* application's home page.
*/
@Singleton
class MainController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val controller = new ChessController
  val tui = new tui(controller)
  val jsonConverter = new FileIO




  def index = Action {
    Ok(views.html.schach(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer), controller.currentPlayer))
  }
  def select(y: Int,x: Int) = Action {
    Ok(views.html.selectableFieldsAjax(controller.chessBoard(y)(x).getPossibleMoves(controller.chessBoard)));
  }

  def move(move: String) = Action {
    tui.processInputLine(move)
    Ok(views.html.schach(jsonConverter.gridToJson(controller.chessBoard, controller.currentPlayer), controller.currentPlayer))
  }
}
