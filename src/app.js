
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
  const putBtn = document.querySelector('#putBtn');
  const delBtn = document.querySelector('#delBtn');
  const expandBtn = document.querySelector('#expand');
  const expandBtn2 = document.querySelector('#expand2');
  
  const user = await getUser();

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => Auth.federatedSignIn();
  logoutBtn.onclick = () => Auth.signOut();

  if (!user) {
    logoutBtn.disabled = true;
    return;
  }

  console.log({ user });
  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;

  getUserFragments(user);
  getUserFragmentsExpanded(user);

  const apiUrl = process.env.API_URL || 'http://localhost:8080';

  const postData = async (contentType, body) => {
    console.log('POST fragments data...');
    console.log('Posting: ', body);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments`, {
        method: "POST",
        body: body,
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type": contentType,
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
  };

  postTpBtn.onclick = () => postData("text/plain", document.querySelector('#textfield').value);
  postMdBtn.onclick = () => postData("text/markdown", document.querySelector('#textfield').value);
  postHtmlBtn.onclick = () => postData("text/html", document.querySelector('#textfield').value);
  postJsonBtn.onclick = () => postData("application/json", document.querySelector('#textfield').value);

  expandBtn.onclick = async () => {
    console.log('Requesting user fragments data...');
    try {
      const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, { headers: user.authorizationHeaders() });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Got user fragments data', { data });
      document.getElementById("displayFragments").innerHTML = "";
      for (const fragment of data.fragments) {
        try {
          const res = await fetch(`${apiUrl}/v1/fragments/${fragment.id}`, { headers: user.authorizationHeaders() });
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
          if (fragment.type.startsWith("text") || fragment.type.startsWith("application")) {
            const data = await res.text();
            document.getElementById("displayFragments").appendChild(document.createElement("hr"));
            document.getElementById("displayFragments").appendChild(document.createTextNode("Fragment id: " + fragment.id));
            document.getElementById("displayFragments").appendChild(document.createElement("br"));
            document.getElementById("displayFragments").appendChild(document.createTextNode(data));
          } else if (fragment.type.startsWith("image")) {
            const data = await res.arrayBuffer();
            const rawData = Buffer.from(data);
            const imageData = new Blob([rawData], {type: fragment.type});
            const image = new Image();
            const reader = new FileReader();
            reader.readAsDataURL(imageData);
            reader.addEventListener("load", function () {
              image.src = reader.result;
              image.alt = fragment.id;
            });
            document.getElementById("displayFragments").appendChild(document.createElement("hr"));
            document.getElementById("displayFragments").appendChild(document.createTextNode("Fragment id: " + fragment.id));
            document.getElementById("displayFragments").appendChild(document.createElement("br"));
            document.getElementById("displayFragments").appendChild(image);
          }
        } catch (err) {
          console.error("Unable to call GET /v1/fragments/:id", { err });
        }
      }
    } catch (err) {
      console.error('Unable to call GET /v1/fragment', { err });
    }
  };

  expandBtn2.onclick = async () => {
    console.log('Requesting user fragments data...');
    try {
      const res = await fetch(`${apiUrl}/v1/fragments?expand=1`, { headers: user.authorizationHeaders() });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('Got user fragments metadata', { data });
      document.getElementById("displayFragments").innerHTML = "";
      for (const fragment of data.fragments) {
        try {
          const res = await fetch(`${apiUrl}/v1/fragments/${fragment.id}/info`, { headers: user.authorizationHeaders() });
          if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}`);
          }
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
  };

  const imgUpload = async (event) => {
    console.log('POST fragments data...');
    console.log(event.target.files);
    for (const file of event.target.files) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async (item) => {
        const res = await fetch(`${apiUrl}/v1/fragments`, {
          method: "POST",
          body: item.target.result,
          headers: {
            Authorization: user.authorizationHeaders().Authorization,
            "Content-Type": file.type,
          },
        });
        const data = await res.json();
        console.log('Posted user fragments data', { data });
      };
    }
  };
  document.querySelector("#imageFile").addEventListener("change", imgUpload);

  // app.js

  putBtn.onclick = async () => {
    console.log('PUT fragments data...');
    const modId = document.querySelector('#fragId').value;
    const newValue = document.querySelector('#textfield2').value;
    const contentType = document.querySelector('#contentType').value; // Assuming there's an input for content type
    console.log('PUT: ', modId, ' with value: ', newValue, ' and content type: ', contentType);
    
    let body;
    
    // Handle different content types
    // if (contentType === "application/json") {
    //   body = JSON.stringify(newValue); // Ensure JSON is stringified
    // } else {
      body = newValue; // For text types, use the string directly
    //}
    
    try {
      const res = await fetch(`${apiUrl}/v1/fragments/${modId}`, {
        method: "PUT",
        body: body,
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
          "Content-Type": contentType, // Use the dynamic content type
        }
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.error.message);
      }
      const data = await res.json();
      console.log('PUT user fragments data', { data });
    } catch (err) {
      console.error('Unable to PUT to /v1/fragment', { err });
    }
  };





  delBtn.onclick = async () => {
    console.log('DELETE fragment');
    const modId = document.querySelector('#fragId').value;
    console.log('DELETE fragment: ', modId);
    try {
      const res = await fetch(`${apiUrl}/v1/fragments/${modId}`, {
        method: "DELETE",
        headers: {
          Authorization: user.authorizationHeaders().Authorization,
        }
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log('DELETE user fragments data', { data });
    } catch (err) {
      console.error('Unable to DELETE to /v1/fragment', { err });
    }
  };
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);
