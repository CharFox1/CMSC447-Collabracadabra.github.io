function hidePassword() {//function hides password if checkbox toggled 
    var x = document.getElementById("pass");

    if (x.type === "password") {
        x.type = "text";
    }
    
    else {
        x.type = "password";
    }
}
