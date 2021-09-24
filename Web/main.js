/*
    main.js
    Initialize the SDK and get
    a reference to the project
*/

var API_KEY = "YOUR-API-KEY";
var ACCESS_KEY = "YOUR-ACCESS-KEY";
var ACCESS_TOKEN = "YOUR-ACCESS-TOKEN";
var project = grandeur.init(API_KEY, ACCESS_KEY, ACCESS_TOKEN);
var datastore = project.datastore();

var timer = null;




function insertData(collection_name){
    var collection = datastore.collection(collection_name);

    const round = (n, dp) => {
        const h = +('1'.padEnd(dp + 1, '0')) // 10 or 100 or 1000 or etc
        return Math.round(n * h) / h
      }

      rounded_value = round(Math.random(),2);
        var documents = [
        {

            timestamp:getCurrentTimeStamp(),
            temperature:27+rounded_value,
            humidity:62+rounded_value,
            ozone_ppm:0.011544+(rounded_value/100),
            ozone_ppb:11.544+(rounded_value*2),
            ozone_mg_m3:0.024398+(rounded_value/100),
            ozone_ug_m3:24.398+(rounded_value*2),
            co2_ppm:306.0+(rounded_value*2),

        }]
        
        // Insert document into a collection
        collection.insert(documents).then((res) => {
            // Got response from server
            switch(res.code) {
            case "DATASTORE-DOCUMENTS-INSERTED": 
                // Methods returns the unique ids of each
                // inserted document
                console.log(res.insertedIDs);
            }
        });
}

function deleteAllData(collection_name){
    var collection = datastore.collection(collection_name);
        collection.delete().then((res) => {
        // Got response from server
        switch(res.code) {
            case "DATASTORE-DOCUMENTS-DELETED": 
            // Method returns the count
            console.log(res.deletedCount);
        }
    });
}

function searchSingleData(collection_name, search_key){
    var collection = datastore.collection(collection_name);
    collection.search({documentID: search_key}).then((res) => {
        // Got response from server
        switch(res.code) {
        case "DATASTORE-DOCUMENTS-FETCHED": 
            // Method returns documents
            console.log(res.documents);
        }
    });
}

function  fetchFirst20Enteries(collection_name){
    // Run operation with $in operator
    var collection = datastore.collection(collection_name);
    collection.search().then((res) => {
    // Got response from server
    switch(res.code) {
        case "DATASTORE-DOCUMENTS-FETCHED": 
        // Method returns documents
            var a = res.documents;
            console.log(a);
    }
  });


    // collection.search({}, {result: 2, documentID: 2,}).then((res) => {
    //     // Got response from server
    //     // documents will contain all fields except name
    //     switch(res.code) {
    //       case "DATASTORE-DOCUMENTS-FETCHED": 
    //         // Method returns documents
    //         console.log(res.documents);
    //     }
    //   });
  
}


async function getAllData(collection_name, type_of_process) {
	/** Variable to store documents */
	var documents = [];
	/** Search datastore and get packets */
	var history = project.datastore().collection(collection_name);
	var res = await history.search();
	/** Push documents to array */
	documents = res.documents;
    documents_array = [];

	/** If the number of documents received
	 *  are less than total. Then query again 
	*/
	var page = 2;

	while(documents.length < res.nDocuments) {
		res = await history.search({}, undefined, page);

		/** Push documents */
		documents = [...documents, ...res.documents];

		/** Increase page number */ 
		page += 1;
	}

    

    if (type_of_process == "all"){
    documents.forEach(doc => {
        /** Push data to chart */
        documents_array.push([doc.timestamp, doc.temperature, doc.humidity, 
                            doc.ozone_ppm, doc.ozone_ppb, doc.ozone_mg_m3, doc.ozone_ug_m3,
                            doc.co2_ppm,
                            ])
        });
       return documents_array;
    }

    else if (type_of_process == "latest"){
        doc = documents[documents.length-1];
        documents_array.push(["Timestamp", doc.timestamp]);
        documents_array.push(["Temperature \u00b0C", doc.temperature.toString()]);
        documents_array.push(["Humidity %", doc.humidity.toString()]);
        documents_array.push(["Ozone in PPM (Parts per Million)", doc.ozone_ppm.toString()]);
        documents_array.push(["Ozone in PPB (Parts per Billion)", doc.ozone_ppb.toString()]);
        documents_array.push(["Ozone in mg/m3 (Milli gram per meter cube)", doc.ozone_mg_m3.toString()]);
        documents_array.push(["Ozone in ug/m3 (Micro gram per meter cube)", doc.ozone_ug_m3.toString()]);
        documents_array.push(["Carbon Dioxide in PPM (Parts per Million)", doc.co2_ppm.toString()]);
        return documents_array;        
    }

    else if (type_of_process == "temperature_n_humidity"){
        documents_array.push(["Timestamp", "Humidity %", "Temperature \u00b0C"]);
        documents.forEach(doc => {
            /** Push data to chart */
            documents_array.push([doc.timestamp, doc.temperature, doc.humidity,])
            });
           return documents_array;
        
    }

    else if(type_of_process == "ozone"){
        documents_array.push(["Timestamp", "Ozone (PPB)", "Ozone (ug/m3)"]);
        documents.forEach(doc => {
            /** Push data to chart */
            documents_array.push([doc.timestamp, doc.ozone_ppb, doc.ozone_ug_m3,])
            });
           return documents_array;
        


    }

    else if (type_of_process == "co2"){
        documents_array.push(["Timestamp", "Carbon Dioxide (PPM)"]);
        documents.forEach(doc => {
            /** Push data to chart */
            documents_array.push([doc.timestamp, doc.co2_ppm,])
            });
           return documents_array;

    }
    
    
}


function getInfo(collection_name, type_of_process){
    let sensor_data = getAllData(collection_name, type_of_process);
        sensor_data.then(function(result) {
            console.log(result);
            return result; // "Some User token"
         })
}

/* Setting the connection status update handler */
project.onConnection((status) => {
  /* 
      This callback gets fired
      whenever the connection status
      changes
  */

  switch(status) {
    case "CONNECTED":
    
        //alert(getCurrentTimeStamp());
        /*
            If SDK is connected,
            we set the status.
        */

        // Define an array of json objects
        //insertData("Sensors");
        
        //deleteAllData("Sensors");
        
        
        document.getElementById("status").innerText = "Connected";

        /* Here we set up the timer to update parms every 5 seconds */
        timer = setInterval(async function() { 
            /* 
                This function updates the device parameters
                and set the state to a random string.
            */
            
            var deviceID = "YOUR-DEVICE-ID";
            
            /* Here we use *Date* for a random state value */
            var state = Date.now();
            
            /* Gets reference to device class */
            var devices = project.devices();
            /* Updates the device state */
            await devices.device(deviceID).data().set("state", Date.now());
   
            /* Logs the state to browser's console */  
            console.log(state);
        }, 5000);
        
        break;
    default: 
        /* If SDK gets disconnected, we display the status
           on the app and clear the timer.
         */
        document.getElementById("status").innerText = "Disconnected";

        /* Clears timer */
        clearInterval(timer);
  }
});

/* Function to login user */
async function login() {
    /* Store credentials into variables */

    var email = "YOUR-EMAIL";
    var password = "YOUR-PASSWORD";

    /* Set the status to logging in */
    document.getElementById("status").innerText = "Logging in";

    /* Then get a reference to auth class */
    var auth = project.auth();

    /* and in a try catch block */
    try {
        /* Submit request using login function */
        var res = await auth.login(email, password);

    /* 
        Got the response to login
        handle response
    */
    switch(res.code) {
      case "AUTH-ACCOUNT-LOGGEDIN": 
      case "AUTH-ACCOUNT-ALREADY-LOGGEDIN":
        /*
            User Authenticated
            Set the status to success
        */
        document.getElementById("status").innerText = "User Authenticated";
        break;

      default: 
        /* 
            Logging failed due
            to invalid data
        */
        document.getElementById("status").innerText = "Authentication Failed";
    }
  }
  catch(err) {
    /*
        Error usually got generated when
        we are not connected to the internet
    */
    document.getElementById("status").innerText = "Network Error";
  }
}

/* Call login on startup */
login();
