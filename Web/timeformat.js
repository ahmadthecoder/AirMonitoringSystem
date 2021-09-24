//==================================================
//                     TIME SETTINGS
//==================================================
function join(t, a, s) {
    function format(m) {
       let f = new Intl.DateTimeFormat('en', m);
       return f.format(t);
    }
    return a.map(format).join(s);
 }

 function addZeroInField(time_str){
    if (time_str.length < 2){return "0"+time_str;}
    return time_str
 }

 function getCurrentDate(){
    let date_month_year = [{day: 'numeric'},{month: 'numeric'}, {year: 'numeric'},];
    let formatted_time = join(new Date, date_month_year, '/');
    var splitted_data = formatted_time.split('/');
    return addZeroInField(splitted_data[0])+"/"+addZeroInField(splitted_data[1])+"/"+splitted_data[2];
 }

 function convertTo24Hours(Formatted12Hour){
    var splitted_data = Formatted12Hour.split(' ');
    if (splitted_data[1] == "PM"){
        splitted_data[0] = (parseInt(splitted_data[0])+12).toString();
    }
    return splitted_data[0];
 }
 function getCurrentTime(ignore_seconds){
    let hour_minute_second = [{hour: 'numeric'}, {minute: 'numeric'}, {second: 'numeric'}];
    var formatted_time = join(new Date, hour_minute_second, ':');
    var splitted_data = formatted_time.split(':');
    var converted_hours = convertTo24Hours(splitted_data[0]);
    if (ignore_seconds){return addZeroInField(converted_hours)+":"+addZeroInField(splitted_data[1]);}
    return addZeroInField(converted_hours)+":"+addZeroInField(splitted_data[1])+":"+addZeroInField(splitted_data[2]);
 }

 function getCurrentTimeStamp(){
    return getCurrentTime(false)+" "+getCurrentDate();
 }


 //======================================================================