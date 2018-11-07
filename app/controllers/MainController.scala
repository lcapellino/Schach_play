package controllers

import javax.inject._
import play.api.mvc._

/**
 * This controller creates an `Action` to handle HTTP requests to the
* application's home page.
*/
@Singleton
class MainController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def index = Action {
    Ok(views.html.schach("Got your command: "))
  }

  def move(move: String) = Action {
    Ok(views.html.schach("Got your command: " + move))
  }
}
