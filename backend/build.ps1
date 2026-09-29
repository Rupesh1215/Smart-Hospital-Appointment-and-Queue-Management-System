$env:JAVA_HOME = "C:\Program Files\Java\jdk-22"
$env:PATH = "C:\Program Files\Java\jdk-22\bin;" + $env:PATH
& mvn package -DskipTests > build_output.log 2>&1
