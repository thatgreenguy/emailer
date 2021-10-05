## docker run --it --env NODE_ENV=testing --name PY920_JSONEMAILER dlink/jdeemailer /bin/bash 


# Project JSON PY image changed to handle DPD and UPS Labels and customer emails
# For now this code is still in dev/uat so exists in image 72496323b25f

# For PY * ONLY * start container based on above image which has Project JSON changes in code

# docker run --detach --env NODE_ENV=testing --name PY920_JSONEMAILER 72496323b25f CMD ["pm2-runtime", "/app/src/index.js"]
docker run -d  --env NODE_ENV=testing --name PY920_JSONEMAILER  75769ccb3c0a  pm2-runtime index.js 
