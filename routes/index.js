var users = [];
var time_log = [];
var is_user = function(user) {
	var users_count = users.length;
	for (var i = 0; i < users_count; i++) {
	if (user == users[i]) {
	return true;
	}
	}
	return false;
}


module.exports = function Route(app, server) {
	var io = require("socket.io").listen(server)
	io.sockets.on("connection", function(socket){
		socket.on("page_load", function(data){
				if(is_user(data.user) === true) {
				socket.emit("existing_user", {error: "This user already exits"})
			} else {
				users.push(data.user);
				// once the new user is admistered, star the timer and pass the data back to client
				var start = new Date().toLocaleString();
				var hr = new Date().getHours();
				var min = new Date().getMinutes();
				time_log.push({name:data.user, start:start, hr:hr, min:min, id:socket.id});
				console.log("time" + time_log);
				socket.emit("start", {current_user: data.user, start:start, time_log:time_log})
			}
		})

		socket.on("disconnect", function(){

			var end = new Date().toLocaleString();

			for (var i = 0; i < time_log.length; i++){
				if (time_log[i].id == socket.id){
				var duration =(new Date().getHours() - time_log[i].hr)*60+new Date().getMinutes() - time_log[i].min;
				console.log("disconneted " + socket.id);
				console.log("duration " + duration);
				time_log.push({name:time_log[i].name, end:end, duration: duration});
				console.log("time"+ time_log);
				socket.broadcast.emit("end", {end: end, name: time_log[i].name, duration: duration});
				}
			}
		})
	})

	app.get("/", function(request, response){
	response.render("index")
	})
}