name := "schach_play"
 
version := "1.2.8"
      
lazy val root = (project in file(".")).enablePlugins(PlayScala)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"
      
resolvers += "Akka Snapshot Repository" at "http://repo.akka.io/snapshots/"
      
scalaVersion := "2.12.8"

libraryDependencies ++= Seq(
  jdbc ,
  ehcache ,
  ws ,
  specs2 % Test,
  guice,
  "net.codingwell" %% "scala-guice" % "4.1.0"
)


//unmanagedResourceDirectories in Test +=  (baseDirectory ( _ /"target/web/public/main" )).value

      