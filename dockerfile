FROM tomcat:10-jdk11-corretto

ADD ./dist/covidshare-ui.war /usr/local/tomcat/webapps/covidshare-ui.war

EXPOSE 8080

CMD ["catalina.sh", "run"]
