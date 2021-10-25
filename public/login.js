const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

const registerForm = document.querySelector('.sign-up-form');
registerForm.addEventListener("submit", function(event) {
  event.preventDefault();
  let formData = {
    name : document.getElementById('name-signup').value,
    designation: document.getElementById('designation-signup').value,
    email: document.getElementById('email-signup').value,
    phone: document.getElementById('phone-signup').value,
    password: document.getElementById('password-signup').value,
    location: document.getElementById('location-signup').value,
  }
  if (formData.name === "" || formData.email === "" || formData.designation === "" || formData.phone === "" || formData.password === "" || formData.location === "") {
    alert('Please fill all the credentials')
  }
  else {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/register');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      window.location.assign('/dashboard')
    }
    xhr.send(JSON.stringify({
      formData
    }))
  }
  
})


const loginForm = document.querySelector('.sign-in-form');
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();
    let loginData = {
      email: document.getElementById('email-signin').value,
      password: document.getElementById('password-signin').value,
    }
    if (loginData.email === "" || loginData.password === "") {
      alert('Please fill all the credentials')
    }
    else {
      let xhr = new XMLHttpRequest();
      xhr.open('POST', '/login');
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = function() {
        window.location.assign('/dashboard')
      }
      xhr.send(JSON.stringify({
        loginData
      }))
      console.log(loginData);
    }
  })

