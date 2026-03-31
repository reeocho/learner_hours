// create constants for the form and the form controls
const passwordSection = document.getElementById('password');
const passwordSubmit = document.querySelector('button[type="password"]');
const searchFormEl = document.getElementsByTagName("form")[2];
console.log("Search form element:", searchFormEl);
const body = document.getElementById('main body');
const newSessionFormEl = document.getElementsByTagName("form")[1];
const inputdateEl = document.getElementById("date");
const startTimeInputEl = document.getElementById("start-time");
const endTimeInputEl = document.getElementById("end-time");
const noteInputEl = document.getElementById("note");
const STORAGE_KEY = "learner-hours";
const pastSessionContainer = document.getElementById("past-sessions");
const clearAll = document.getElementById("clear-all");
let sessionsDisplayed = 5; // Track how many sessions are currently displayed

function checkPasswordAndToggle() {
  const passwordInput = document.getElementById('passwordinput');
  const enteredpass = passwordInput.value;
  if (enteredpass === 'password') {
    passwordSection.style.display = 'none';
    body.style.display = 'block';
    sessionStorage.setItem('passwordVerified', true);
  } else {
    alert('Incorrect password. Please try again.');
    passwordInput.value = '';
  }
}

if (!sessionStorage.getItem('passwordVerified')) {
  console.log("yay");
  body.style.display = 'none';
  passwordSection.style.display = 'block';


  passwordSubmit.addEventListener('click', function(event) {
    event.preventDefault();
    checkPasswordAndToggle();
  });
}


clearAll.addEventListener("click", () => {
  if (confirm("Confirm deletion.")) {
    localStorage.removeItem(STORAGE_KEY);
    renderPastSessions();
    alert("All sessions cleared successfully, please reload page.");
  }
});

newSessionFormEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const date = inputdateEl.value;
  const startTime = startTimeInputEl.value;
  const endTime = endTimeInputEl.value;
  const note = noteInputEl.value;

  // Check if the date is invalid
  if (checkDateInvalid(date)) {
    // If the date is invalid, exit.
    return;
  }

  // Check if the times are invalid
  if (checkTimesInvalid(startTime, endTime)) {
    // If the times are invalid, exit.
    return;
  }

  // Store the new session in our client-side storage.
  
  storeNewSession(date, startTime, endTime, note);

  // Refresh the UI.
  renderPastSessions();
  // Reset the form.
  newSessionFormEl.reset();
});

function searchSessions(input) {
  if (checkSearchInvalid(input)) {
    return;
  }
  const sessions = getAllStoredSessions();
  const filteredSessions = sessions.filter(session => {
    return session.note.toLowerCase().includes(input);
  });
  renderFilteredSessions(filteredSessions);
}

searchFormEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim().toLowerCase();
  searchSessions(query);
});

function renderFilteredSessions(sessions) { /* mostly copy-pasted from renderPastSessions, but with some adjustments to show only filtered sessions and a header for search results */
  const allSessions = getAllStoredSessions();
  pastSessionContainer.textContent = "";
  if (sessions.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No sessions found matching your search.";
    pastSessionContainer.appendChild(emptyMessage);
    return;
  } else {
    const header = document.createElement("h2");
    header.textContent = "Search results";
    pastSessionContainer.appendChild(header);
    const list = document.createElement("ul");
    list.style.listStyle = "none";
    sessions.forEach(session => {
      const index = allSessions.findIndex(s => s.date === session.date && s.startTime === session.startTime && s.endTime === session.endTime && s.note === session.note);
      const sessionEl = document.createElement("li");

      // Create display view
      const displayDiv = document.createElement("div");
      displayDiv.className = "session-display";
      
      const sessionText = document.createElement("span");
      sessionText.textContent = `${formatDate(session.date)}: ${formatTime(session.startTime)} --> ${formatTime(session.endTime)}: ${(session.note)}`;
      sessionText.style.marginRight = "20px";
      
      // buttons
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginRight = "10px";
      const delbutton = document.createElement("button");
      delbutton.textContent = "Delete";
      
      displayDiv.appendChild(sessionText);
      displayDiv.appendChild(editBtn);
      displayDiv.appendChild(delbutton);
      
      // Edit view
      const edit = document.createElement("div");
      edit.className = "session-edit";
      edit.style.display = "none";
      edit.style.marginTop = "10px";
      
      // Date input
      const label = document.createElement("label");
      label.textContent = "Date: ";
      const inputdate = document.createElement("input");
      inputdate.type = "date";
      inputdate.value = session.date;
      inputdate.style.marginRight = "10px";
      
      // Start time input
      const startLabel = document.createElement("label");
      startLabel.textContent = "Start: ";
      const startInput = document.createElement("input");
      startInput.type = "time";
      startInput.value = session.startTime;
      startInput.style.marginRight = "10px";
      
      // End time input
      const endLabel = document.createElement("label");
      endLabel.textContent = "End: ";
      const endInput = document.createElement("input");
      endInput.type = "time";
      endInput.value = session.endTime;
      endInput.style.marginRight = "10px";

      // Note input
      const noteLabel = document.createElement("label");
      noteLabel.textContent = "Note: ";
      const noteInput = document.createElement("input");
      noteInput.type = "text";
      noteInput.value = session.note;
      noteInput.style.marginRight = "10px";
      noteInput.style.marginBottom = "10px";

      
      // Save button
      const savebutton = document.createElement("button");
      savebutton.textContent = "Save";
      savebutton.style.marginRight = "5px";
      savebutton.style.cursor = "pointer";
      
      // Cancel button
      const cancel = document.createElement("button");
      cancel.textContent = "Cancel";
      cancel.style.cursor = "pointer";
      
      edit.appendChild(label);
      edit.appendChild(inputdate);
      edit.appendChild(document.createElement("br"));
      edit.appendChild(startLabel);
      edit.appendChild(startInput);
      edit.appendChild(endLabel);
      edit.appendChild(endInput);
      edit.appendChild(document.createElement("br"));
      edit.appendChild(noteLabel);
      edit.appendChild(noteInput);
      edit.appendChild(document.createElement("br"));
      edit.appendChild(savebutton);
      edit.appendChild(cancel);
      
      sessionEl.appendChild(displayDiv);
      sessionEl.appendChild(edit);
      
      // Edit button click handler
      editBtn.onclick = () => {
        displayDiv.style.display = "none";
        edit.style.display = "block";
      };
      
      // Cancel button click handler
      cancel.onclick = () => {
        displayDiv.style.display = "block";
        edit.style.display = "none";
        // Reset inputs to original values
        inputdate.value = session.date;
        startInput.value = session.startTime;
        endInput.value = session.endTime;
        noteInput.value = session.note;
      };
      
      savebutton.onclick = () => {
        const newDate = inputdate.value;
        const newStartTime = startInput.value;
        const newEndTime = endInput.value;
        const newNote = noteInput.value;
        
        // revalidate inputs
        if (checkDateInvalid(newDate)) {
          return;
        }
        
        if (checkTimesInvalid(newStartTime, newEndTime)) {
          return;
        }
        
        // Update session
        allSessions[index] = {
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          note: newNote
        };
        
        // Sort sessions by date
        allSessions.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
        
        // Re-render search results
        const filtered = allSessions.filter(s => s.note.toLowerCase().includes(document.getElementById("search").value.trim().toLowerCase()));
        renderFilteredSessions(filtered);
        alert("Session updated successfully!");
      };
      
      delbutton.onclick = () => {
        if (confirm(`Delete session from ${formatDate(session.date)}?`)) {
          allSessions.splice(index, 1);
          if (allSessions.length === 0) {
            localStorage.removeItem(STORAGE_KEY);
          } else {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
          }
          // Re-render search results
          const filtered = allSessions.filter(s => s.note.toLowerCase().includes(document.getElementById("search").value.trim().toLowerCase()));
          renderFilteredSessions(filtered);
        }
      };
      
      list.appendChild(sessionEl);
    });
    pastSessionContainer.appendChild(list);
  }
}

function checkDateInvalid(date) {
  // Check that date is not null or in future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateObj = new Date(date);

  if (!date) {
    alert("Date required");
    newSessionFormEl.reset();
    return true
  } else if (dateObj > today) {
    alert("Date in future");
    newSessionFormEl.reset();
    return true;
  }
  return false;
}

function checkSearchInvalid(search) {
  if (!search) {
    // If no search query, show all sessions
    renderPastSessions();
    return true;
  }
  return false;
}

function checkTimesInvalid(startTime, endTime) {
  // Check that end time is after start time and neither is null.
  
  if (!startTime || !endTime || startTime > endTime) {
    newSessionFormEl.reset();
    
    alert("Timestamps invalid");
    // as times are invalid, we return true
    return true;
  }
  // else
  return false;
}

function storeNewSession(date, startTime, endTime, note) {
  // Get data from storage.
  const sessions = getAllStoredSessions();

  // Add the new session object to the end of the array of session objects.
  sessions.push({ date, startTime, endTime, note });

  // Sort the array so that sessions are ordered by date, from newest
  // to oldest.
  sessions.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  // Store the updated array back in the storage.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  
  alert("Sessions saved successfully")
}

function getAllStoredSessions() {
  // Get the string of session data from localStorage
  const data = window.localStorage.getItem(STORAGE_KEY);

  // If no sessions were stored, default to an empty array
  // otherwise, return the stored data as parsed JSON
  const sessions = data ? JSON.parse(data) : [];

  return sessions;
}

function renderPastSessions(reset = true) {
  const sessions = getAllStoredSessions();
  if (reset) { /*on initial render only*/
    sessionsDisplayed = 5;
  }

  pastSessionContainer.textContent = "";

  if (sessions.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "No past sessions recorded.";
    pastSessionContainer.appendChild(emptyMessage);
    return;
  }

  const prevheader = document.createElement("h2");
  prevheader.textContent = "Past sessions";

  const prevlist = document.createElement("ul");
  prevlist.style.listStyle = "none";

  sessions.slice(0, sessionsDisplayed).forEach((session, displayIndex) => {
    const index = sessions.indexOf(session);
    const sessionEl = document.createElement("li");
    const displayDiv = document.createElement("div");
    displayDiv.className = "session-display";
    
    const sessionText = document.createElement("span");
    sessionText.textContent = `${formatDate(session.date)}: ${formatTime(session.startTime)} --> ${formatTime(session.endTime)}: ${(session.note)}`;
    sessionText.style.marginRight = "20px";
    
    const noteText = document.createElement("p");
    noteText.textContent = session.note;

    // buttons
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.marginRight = "10px";
    const delbutton = document.createElement("button");
    delbutton.textContent = "Delete";
    displayDiv.appendChild(sessionText);
    displayDiv.appendChild(editBtn);
    displayDiv.appendChild(delbutton);
    
    // Edit view
    const edit = document.createElement("div");
    edit.className = "session-edit";
    edit.style.display = "none";
    edit.style.marginTop = "10px";
    
    // Date input
    const label = document.createElement("label");
    label.textContent = "Date: ";
    const inputdate = document.createElement("input");
    inputdate.type = "date";
    inputdate.value = session.date;
    inputdate.style.marginRight = "10px";
    
    // Start time input
    const startLabel = document.createElement("label");
    startLabel.textContent = "Start: ";
    const startInput = document.createElement("input");
    startInput.type = "time";
    startInput.value = session.startTime;
    startInput.style.marginRight = "10px";
    
    // End time input
    const endLabel = document.createElement("label");
    endLabel.textContent = "End: ";
    const endInput = document.createElement("input");
    endInput.type = "time";
    endInput.value = session.endTime;
    endInput.style.marginRight = "10px";

    // Note input
    const noteLabel = document.createElement("label");
    noteLabel.textContent = "Note: ";
    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.value = session.note;
    noteInput.style.marginRight = "10px";
    noteInput.style.marginBottom = "10px";

    
    // Save button
    const savebutton = document.createElement("button");
    savebutton.textContent = "Save";
    savebutton.style.marginRight = "5px";
    savebutton.style.cursor = "pointer";
    
    // Cancel button
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.style.cursor = "pointer";
    
    edit.appendChild(label);
    edit.appendChild(inputdate);
    edit.appendChild(document.createElement("br"));
    edit.appendChild(startLabel);
    edit.appendChild(startInput);
    edit.appendChild(endLabel);
    edit.appendChild(endInput);
    edit.appendChild(document.createElement("br"));
    edit.appendChild(noteLabel);
    edit.appendChild(noteInput);
    edit.appendChild(document.createElement("br"));
    edit.appendChild(savebutton);
    edit.appendChild(cancel);
    
    sessionEl.appendChild(displayDiv);
    sessionEl.appendChild(edit);
    
    // Edit button click handler
    editBtn.onclick = () => {
      displayDiv.style.display = "none";
      edit.style.display = "block";
    };
    
    // Cancel button click handler
    cancel.onclick = () => {
      displayDiv.style.display = "block";
      edit.style.display = "none";
      // Reset inputs to original values
      inputdate.value = session.date;
      startInput.value = session.startTime;
      endInput.value = session.endTime;
      noteInput.value = session.note;
    };
    
    savebutton.onclick = () => {
      const newDate = inputdate.value;
      const newStartTime = startInput.value;
      const newEndTime = endInput.value;
      const newNote = noteInput.value;
      
      // revalidate inputs
      if (checkDateInvalid(newDate)) {
        return;
      }
      
      if (checkTimesInvalid(newStartTime, newEndTime)) {
        return;
      }
      
      // Update session
      sessions[index] = {
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        note: newNote
      };
      
      // Sort sessions by date
      sessions.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      
      // Re-render
      renderPastSessions();
      alert("Session updated successfully!");
    };
    
    delbutton.onclick = () => {
      if (confirm(`Delete session from ${formatDate(session.date)}?`)) {
        sessions.splice(index, 1);
        if (sessions.length === 0) {
          localStorage.removeItem(STORAGE_KEY);
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
        renderPastSessions();
      }
    };
    
    prevlist.appendChild(sessionEl);
  });
  
  pastSessionContainer.appendChild(prevheader);
  pastSessionContainer.appendChild(prevlist);
  
  // Add "Show More" button if there are more sessions to display
  const showDiv = document.getElementById("show");
  
  // Remove any existing "Show More" button
  const existingShowMoreBtn = showDiv.querySelector('button[data-show-more="true"]');
  if (existingShowMoreBtn) {
    existingShowMoreBtn.remove();
  }
  
  if (sessions.length > sessionsDisplayed) {
    const showMoreBtn = document.createElement("button");
    showMoreBtn.setAttribute("data-show-more", "true");
    showMoreBtn.textContent = `Show More (${sessions.length - sessionsDisplayed} more)`;
    showMoreBtn.style.marginRight = "10px";
    showMoreBtn.onclick = () => {
      sessionsDisplayed += 5;
      renderPastSessions(false); // Don't reset the counter
    };
    showDiv.insertBefore(showMoreBtn, clearAll);
  }
}

function formatDate(dateString) {
  // Convert the date string to a Date object.
  const date = new Date(dateString);

  // Format the date into a locale-specific string.
  return date.toLocaleDateString();

}

function formatTime(timeString) {
  // Separate hour and minutes from timeString
  const [hour, minute] = timeString.split(':');

  // Convert hour from string to integer
  intHour= parseInt(hour);

  // Determine if AM or PM
  period = "AM";
  if (intHour > 12) {
    intHour -= 12;
    period = "PM";
  }
 
  // Display 0 hours as 12 AM
  if (intHour == 0) {
    intHour = 12;
  }

  // Format 12 hour time string
  const formattedTime = intHour + ":" + minute + " " + period;

  return formattedTime;
}

renderPastSessions();