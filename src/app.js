console.log('Hello world!');

// console.log(process.env);

// src/app.js

import { Auth, getUser } from './auth';

import { getUserFragments, getUserFragmentsExpanded } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  
  const postTpBtn = document.querySelector('#textPlainBtn');
  const postMdBtn = document.querySelector('#textMdBtn');
  const postHtmlBtn = document.querySelector('#textHtmlBtn');
  const postJsonBtn = document.querySelector('#applicationJsonBtn');
  
  const expandBtn = document.querySelector('#expand');
  const expandBtn2 = document.querySelector('#expand2');
  
  const user = await getUser();

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  //const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
  
  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);
  getUserFragmentsExpanded(user);


  const apiUrl = process.env.API_URL || 'http://localhost:8080';
  // Post button
  postTpBtn.onclick = async() => {
    console.log('POST fragments data...');
    console.log('Posting: ' + document.querySelector('#textfield').value);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: "POST",
        body: document.querySelector('#textfield').value,
        // Generate headers with the proper Authorization bearer token to pass
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type" : "text/plain",
        }
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Posted user fragments data', { data });
    } catch (err) {
      console.error('Unable to POST to /v1/fragment', { err });
    }
  }
  postMdBtn.onclick = async() => {
    console.log('POST fragments data...');
    console.log('Posting: ' + document.querySelector('#textfield').value);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: "POST",
        body: document.querySelector('#textfield').value,
        // Generate headers with the proper Authorization bearer token to pass
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type" : "text/markdown",
        }
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Posted user fragments data', { data });
    } catch (err) {
      console.error('Unable to POST to /v1/fragment', { err });
    }
  }
  postHtmlBtn.onclick = async() => {
    console.log('POST fragments data...');
    console.log('Posting: ' + document.querySelector('#textfield').value);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: "POST",
        body: document.querySelector('#textfield').value,
        // Generate headers with the proper Authorization bearer token to pass
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type" : "text/html",
        }
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Posted user fragments data', { data });
    } catch (err) {
      console.error('Unable to POST to /v1/fragment', { err });
    }
  }

  postJsonBtn.onclick = async() => {
    console.log('POST fragments data...');
    console.log('Posting: ' + document.querySelector('#textfield').value);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: "POST",
        body: document.querySelector('#textfield').value,
        // Generate headers with the proper Authorization bearer token to pass
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type" : "application/json",
        }
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Posted user fragments data', { data });
    } catch (err) {
      console.error('Unable to POST to /v1/fragment', { err });
    }
  }
  
  
  // Display fragments
  expandBtn.onclick = async() => {
    console.log('Requesting user fragments data...');
    try {
      const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
        // Generate headers with the proper Authorization bearer token to pass
        headers: user.authorizationHeaders(),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Got user fragments data', { data });
      // Loop through res fragments and fetch
      document.getElementById("displayFragments").innerHTML = "";
      for (const fragment of data.fragments) {
        try {
          const res = await fetch(`${apiUrl}/v1/fragments/${fragment.id}`, {
            // Generate headers with the proper Authorization bearer token to pass
            headers: user.authorizationHeaders(),
          });
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          // Populate with text fragment
          if (fragment.type.startsWith("text") || fragment.type.startsWith("application")) {
            const data = await res.text();
            document.getElementById("displayFragments").appendChild(document.createElement("hr"));
            document.getElementById("displayFragments").appendChild(document.createTextNode("Fragment id: " + fragment.id));
            document.getElementById("displayFragments").appendChild(document.createElement("br"));
            document.getElementById("displayFragments").appendChild(document.createTextNode(data));
          } 
         } catch (err) {
          console.error("Unable to call GET /v1/fragments/:id", { err });
         }
      }
    } catch (err) {
      console.error('Unable to call GET /v1/fragment', { err });
    }
  }

  expandBtn2.onclick = async() => {
    console.log('Requesting user fragments data...');
    try {
      const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, {
        // Generate headers with the proper Authorization bearer token to pass
        headers: user.authorizationHeaders(),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Got user fragments metadata', { data });
      // Loop through res fragments and fetch
      document.getElementById("displayFragments").innerHTML = "";
      for (const fragment of data.fragments) {
        try {
          const res = await fetch(`${apiUrl}/v1/fragments/${fragment.id}/info`, {
            // Generate headers with the proper Authorization bearer token to pass
            headers: user.authorizationHeaders(),
          });
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          // Populate with fragment metadata
          const data = await res.text();
          document.getElementById("displayFragments").appendChild(document.createElement("hr"));
          document.getElementById("displayFragments").appendChild(document.createTextNode("Fragment id: " + fragment.id));
          document.getElementById("displayFragments").appendChild(document.createElement("br"));
          document.getElementById("displayFragments").appendChild(document.createTextNode(data));
        } catch (err) {
          console.error("Unable to call GET /v1/fragments/:id", { err });
        }
      }
    } catch (err) {
      console.error('Unable to call GET /v1/fragment', { err });
    }
  }

}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);