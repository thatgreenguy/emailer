###docker run --rm -it --env NODE_ENV=testing -v `pwd`:/app dlink/jdeemailer  bash
##docker run -it --env NODE_ENV=testing -v `pwd`:/app dlink/jdeemailer  bash



# WE are using an unamed docker commit image until code fully tested and signed off and we can rebuild with Dockerfile to replace dlink/emailer
docker run -it --env NODE_ENV=testing -v `pwd`:/app   75769ccb3c0a     bash


