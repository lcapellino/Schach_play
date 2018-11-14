package controllers

import javax.inject._

import controller.ChessController
import play.api.mvc._
import view.tui

/**
 * This controller creates an `Action` to handle HTTP requests to the
* application's home page.
*/
@Singleton
class MainController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val controller = new ChessController
  val tui = new tui(controller)




  def index = Action {
    Ok(views.html.schach(tui.print()))
  }

  def move(move: String) = Action {
    tui.processInputLine(move)
    Ok(views.html.schach(tui.print()))
  }
}
