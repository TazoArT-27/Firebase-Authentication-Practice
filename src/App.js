import React, { useState } from 'react';
import './App.css';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';

firebase.initializeApp(firebaseConfig)

function App() {
  const [newUser, setNewUser] =useState(false);
  const [user, setUser] = useState({
    isSignedIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false,
  })

  const provider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
    .then(result => {
      const {displayName, photoURL, email} = result.user;
      const signedInUser = {
        isSignedIn: true,
        name: displayName,
        email: email,
        photo: photoURL,
      }
      setUser(signedInUser);
      console.log(displayName, photoURL, email)
    })
    .catch(error => {
      console.log(error);
      console.log(error.message);
    
    })
  }

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(result => {
      const signedOutUser = {
        isSignedIn: false,
        name:'',
        photo: '',
        email: '',
      }
      setUser(signedOutUser)
    })
    .catch(error => {
        
    })
  }
  const handleFbLogIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then(function(result) {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  const handleSubmit = (event) => {
    //console.log(user.email, user.password)
    if(newUser && user.email && user.password){
       //console.log('submitting')
       firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        // Handle Errors here.
        .then(response => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          //console.log(response)
          newUserInfo.success = true;
          setUser(newUserInfo);
        })

        .catch(error =>{
        const newUserInfo = {...user};
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(errorCode,errorMessage)
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        })
        
      
    }
    
    if(!newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(response => {
        const newUserInfo = {...user};
          newUserInfo.error = '';
          //console.log(response)
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
          console.log('sign in user info', response.user)
      })
      .catch(function(error) {
        const newUserInfo = {...user};
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error(errorCode,errorMessage)
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
      });
    }

    event.preventDefault()
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

      user.updateProfile({
        displayName: name,
        
      }).then(function() {
        // Update successful.
        //console.log(username updated successfully)
      }).catch(function(error) {
        // An error happened.
      });
  }

  const handleBlur = (event) => {
    let isFieldValid;
    if(event.target.name === 'email'){
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value);
      console.log(isFieldValid);
    }
    if(event.target.name === 'password'){
      const isPasswordValid = event.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test( event.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber;

    }
    if(event.target.name === 'name'){
      isFieldValid = event.target.value;
      console.log(isFieldValid);
    }
    if(isFieldValid){
     const newUserInfo = {...user};
     newUserInfo[event.target.name] = event.target.value;
     setUser(newUserInfo);

    }
     //console.log(event.target.value);
  }

  return (
    <div className="App">
      {
        user.isSignedIn ? <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbLogIn}>Sign Facebook</button>
      {
        user.isSignedIn && <div>
        <p> Welcome, {user.name}</p>
        
        <p>Email: {user.email}</p>
        <img src={user.photo} alt=""/>
        </div>
      }


      <h1> Our Own Authentication</h1>
      
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">New User Sign Up</label>
      <form onSubmit={handleSubmit} action="">
        {newUser && <input type="text" name='name' onBlur={handleBlur} placeholder='name' required/>}
        <br/>
        <input type="text" name="email" onBlur={handleBlur} placeholder="write your email address" required/>
        <br/>
        <input type="password" name="password" onBlur={handleBlur} placeholder="your password" required/>
        <br/>
        <input type="submit" value={newUser ? 'Submit' : 'Sign In'}></input>
      </form>
      <p style={{color: 'red'}}>{user.error}</p>
      {
        user.success && <p style={{color: 'green'}}>User {newUser ? 'created' : 'logged in'} success!</p>
      }
    </div>
  );
}

export default App;
