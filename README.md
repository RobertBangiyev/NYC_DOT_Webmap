# NYC DOT Webmap 


## Setting up GeoServer

First, you need to [install Java](https://www.java.com/download/ie_manual.jsp), and create a new environment variable called JAVA_HOME with its value being the file destination of the Java folder.

After that, [install Apache Tomcat](http://tomcat.apache.org/) by downloading the zip file, and then pasting the folder inside into your C drive.

Next, you want to [install GeoServer](http://geoserver.org/download/) by clicking on the available stable version and downloading the Web Archive (war). Inside the zip folder, copy the geoserver.war file and paste it into the webapps directory inside of your Tomcat folder (for me, this was C:\apache-tomcat-9.0.53\webapps).

To open GeoServer, you need to open the Tomcat folder in your C drive, navigate into the bin subfolder, and execute the startup.bat executable. You should be able to go to localhost:8080/geoserver in your web browser (it will take a few seconds to finish startup and open). Username and password are admin and geoserver, respectively.

The next step is to enable CORS for GeoServer, which is explained well [here](https://docs.geoserver.org/latest/en/user/production/container.html#enable-cors). Follow the instructions for Tomcat. The program will be unable to send requests to GeoServer if this step is not done.


#### **Pre-release Build Only:**

For testing the base-map layer functionality, you would have to publish three layers in GeoServer, one titled "Streets and Highways Reconstruction", another titled "Wetlands", and the final one titled "Sidewalk Cafe Regulations"


## Setting up this project

Simply download the ZIP, and open index.html
