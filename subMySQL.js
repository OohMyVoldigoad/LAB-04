// MQTT subscriber
var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://45.76.185.168:1234')
var topic = 'building/temperature'
 
// MySQL 
var mysql = require('mysql')
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mqttJS'
})
db.connect(()=>{
    console.log('Database connected!')
})



client.on('message', (topic, message)=>{
    message = message.toString()
    console.log(message)
    if(message.slice(0,1) != '{' && message.slice(0,4) != 'mqtt'){
        var dbStat = 'insert into mqttJS set ?'
        var data = {
            message: message
        }
        db.query(dbStat, data, (error, output)=>{
            if(error){
                console.log(error)
            } else {
                console.log('- Data saved to database!')
            }
        })
    }
  
})

client.on('connect', ()=>{
    client.subscribe(topic)
})



 
