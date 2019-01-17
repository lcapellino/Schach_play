logLevel := Level.Warn

resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.6.21")
addSbtPlugin("com.typesafe.sbt" % "sbt-native-packager" % "0.8.0")
addSbtPlugin("org.scalariform" % "sbt-scalariform" % "1.8.2")
