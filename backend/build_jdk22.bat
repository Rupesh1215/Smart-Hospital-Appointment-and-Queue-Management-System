@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-22"
set "PATH=C:\Program Files\Java\jdk-22\bin;%PATH%"
cd /d d:\Smart_Hospital_ENE2\backend
mvn clean package -DskipTests
