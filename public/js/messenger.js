let socket;
let ArrivalMessage = {};
let activeConv = "conv0";

window.onload = function () {
	console.log("asdasdsa");
	fetchTokken();
	setSocket();
	emitUser();
	// arrivalMessage();
	getPatients();
};

function setSocket() {
	socket = io("ws://localhost:3000");
}

//fethcing user from localStorage
function fetchTokken() {
	console.log("sadasdsa");
	token = document.cookie.split("token=")[1];
	let url = "/auth/me";
	let h = new Headers();
	h.append("authorization", "Bearer " + token);

	let req = new Request(url, {
		method: "GET",
		mode: "cors",
		headers: h,
	});

	fetch(req)
		.then((res) => res)
		.then((response) => {
			console.log(response)
			const {
				data
			} = response;
			console.log(data)
			localStorage.setItem(
				"userId",
				data._id
			)(
				//check which role is currently logged in
				data.role == "patient" ? getDoctors() : getPatients()
			);
		})
		.catch((err) => console.log(err.message));
}





//fetch all patients from DB
function getPatients() {
	const list = JSON.parse(localStorage.getItem("patientsList"));
	if (list == "undefined" || list == null) {
		var requestOptions = {
			method: "GET",
			redirect: "follow",
		};

		fetch("http://localhost:3000/doctor/get-patients", requestOptions)
			.then((response) => response.json())
			.then((result) => {
				localStorage.setItem("patientsList", JSON.stringify(result));
			})
			.catch((error) => console.log("error", error));
	}
	showConversations();
}






// fetching Doctors from Db
function getDoctors() {
	const list = JSON.parse(localStorage.getItem("doctorsList"));
	if (list == "undefined" || list == null) {
		var requestOptions = {
			method: "GET",
			redirect: "follow",
		};

		fetch("http://localhost:3000/doctor/info", requestOptions)
			.then((response) => response.json())
			.then((result) => {
				//storing all doctors in local storage
				localStorage.setItem("doctorsList", JSON.stringify(result.data));
			})
			.catch((error) => console.log("error", error));
	}

	showDoctorsList();
}





//show all doctors to patient
function showDoctorsList() {
	let el = document.getElementById("contactList");
	el.innerHTML = "";
	let docData = JSON.parse(localStorage.getItem("doctorsList"));
	//displaying all Doctors
	for (i = 0; i < docData.length; i++) {
		el.innerHTML += `
					<li class="contact" id=${docData[i]._id} onclick="fetchMessages(this.id)">
						<div class="wrap">
							<span class="contact-status"></span>
							<img src="http://0.gravatar.com/avatar/3f009d72559f51e7e454b16e5d0687a1?s=96&d=mm&r=g" alt="" />
						<div class="meta">
							<p class="name">${docData[i].name}</p>
							<p class="preview"></p>
						</div>
						</div>
					</li>    `;
	}
}







function showConversations() {
	let uid = localStorage.getItem("userId");

	var requestOptions = {
		method: "GET",
		redirect: "follow",
	};

	fetch(`http://localhost:3000/conversation/${uid}`, requestOptions)
		.then((response) => response.json())
		.then((result) => {
			let el = document.getElementById("contactList");
			el.innerHTML = "";

			let value = JSON.parse(localStorage.getItem("patientsList"));

			for (i = 0; i < result.length; i++) {
				for (j = 0; j < value.data.length; j++) {
					if (value.data[j]._id == result[i].members[0]) {
						el.innerHTML += `<li class="contact" id=${result[i].members[0]} onclick="fetchMessages(this.id)">
		<div class="wrap">
			<span class="contact-status"></span>
			<img src="http://0.gravatar.com/avatar/3f009d72559f51e7e454b16e5d0687a1?s=96&d=mm&r=g" alt="" />
			<div class="meta">
				<p class="name">${value.data[j].name}</p>
				<p class="preview"></p>
			</div>
		</div>
	</li>    `;
					}
				}
			}
		})
		.catch((error) => console.log("error", error));
}






//fetch conversation messages
function fetchMessages(id) {
	let recverId = id;

	let senderId = localStorage.getItem("userId");
	var requestOptions = {
		method: "GET",
		redirect: "follow",
	};

	fetch(
			`http://localhost:3000/conversation/find/${senderId}/${recverId}`,
			requestOptions
		)
		.then((response) => response.json())
		.then((result) => {
			result == null ? newConversation(id) : getChat(result._id, result);
		})
		.catch((error) => console.log("error", error));

	arrived();
}






//get all the messages of that conversations
function getChat(conversationId, currentChat) {
	localStorage.setItem("currentChat", JSON.stringify(currentChat));

	let userId = localStorage.getItem("userId");
	let el = document.getElementById("messageBox");
	el.innerHTML = "";
	var requestOptions = {
		method: "GET",
		redirect: "follow",
	};

	fetch(`http://localhost:3000/message/${conversationId}`, requestOptions)
		.then((response) => response.json())
		.then((result) => {
			for (i = 0; i < result.length; i++) {
				el.innerHTML += `
				<li class=${result[i].sender == userId ? "replies" : "sent"}>
					<p>${result[i].text}</p>
				</li>`;
			}
		})
		.catch((error) => console.log("error", error));
}






//give Id to new Conversation
function newConversation(recId) {
	let userId = localStorage.getItem("userId");
	//Api Call
	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");
	var raw = JSON.stringify({
		senderId: userId,
		receiverId: recId
	});
	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};

	fetch("http://localhost:3000/conversation", requestOptions)
		.then((response) => response.json())
		.then((result) => getChat())
		.catch((error) => console.log("error", error));
}





//new message generated
function newMessage() {
	let currentChat = JSON.parse(localStorage.getItem("currentChat"));
	let userId = localStorage.getItem("userId");
	let text = document.getElementById("formData").value;

	const receiverId = currentChat.members.find((member) => member !== userId);

	socket.emit("sendMessage", {
		senderId: userId,
		receiverId,
		text: text,
	});

	var myHeaders = new Headers();
	myHeaders.append("Content-Type", "application/json");

	var raw = JSON.stringify({
		conversationId: currentChat._id,
		sender: userId,
		text: text,
	});

	var requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};

	fetch("http://localhost:3000/message/", requestOptions)
		.then((response) => response.json())
		.then(result => console.log(result))
		.catch((error) => console.log("error", error));

	document.getElementById("formData").value = "";
	let el = document.getElementById("messageBox");
	el.innerHTML += `
		  <li class="replies"}>
			  <p>${text}</p>
		  </li>`;
	arrived();
}

function emitUser() {
	let uid = localStorage.getItem("userId");
	socket.emit("addUser", uid);
	socket.on("getUsers", (users) => {});
}

function arrivalMessage() {
	socket.on("getMessage", (data) => {
		let el = document.getElementById("messageBox");
		let userId = localStorage.getItem("userId");
		el.innerHTML += `
				<li class=${data.senderId == userId ? "replies" : "sent"}>
					<p>${data.text}</p>
				</li>`;

		ArrivalMessage = {
			sender: data.senderId,
			text: data.text,
			createdAt: Date.now(),
		};
	});
	arrived();
}

// function arrived() {
// 	let currentChat = JSON.parse(localStorage.getItem("currentChat"));
// 	ArrivalMessage &&
// 		currentChat ? .members.includes(arrivalMessage.sender) &&
// 		setMessages((prev) => [...prev, arrivalMessage]);
// }