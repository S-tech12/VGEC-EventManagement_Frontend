document.addEventListener("DOMContentLoaded", () => {
    const alreadyShown = localStorage.getItem("instructionModalShownForStudents");

    if (!alreadyShown) {
        const instructionModal = new bootstrap.Modal(document.getElementById('instructionModal'));
        instructionModal.show();

        document.getElementById('acknowledgeInstructions').addEventListener('click', () => {
            localStorage.setItem("instructionModalShownForStudents", "true");
            instructionModal.hide();
        });
    }

    GetEvents();
});

async function GetEvents() {

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please login First!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        }).then(()=>{
            window.location.href = "../Login_Folder/Login.html";
        })
    }

    try {
        const response = await fetch("https://vgec-eventmanagement-backend.onrender.com/getAllEventDataForParticipate", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const eventData = await response.json();

        console.log(eventData);

        const container = document.getElementById("eventCardsContainer");

        if (response.ok) {

            // Sort events in ascending order by date
            eventData.sort((a, b) => new Date(a.Event_date) - new Date(b.Event_date));

            eventData.forEach(event => {
                const card = document.createElement("div");
                card.className = "card";
                card.style.width = "18rem";
                card.style.boxShadow = "2px 4px 20px black";
                card.style.borderRadius = "15px";
                card.style.cursor = "pointer";
                card.style.transition = "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out";
                card.setAttribute("data-bs-toggle", "modal");
                card.setAttribute("data-bs-target", "#eventDetailModal");
                card.setAttribute("onclick", `showDetails(${JSON.stringify(event)})`);

                // Check if the event is free
                const isFree = event.Event_payment === "Free";

                card.innerHTML = `
                    ${isFree ? `
                        <div class="Freeribbon">
                            <span>Free</span>
                        </div>` : `
                        <div class="Paidribbon">
                            <span>Paid</span>
                        </div>`
                    }
                    <img class="card-img-top" src="${event.Event_Poster}" alt="${event.Event_name}">
                    <div class="card-body">
                        <h5 class="card-title">${event.Event_name}</h5>
                        <p class="card-text">
                            <div id="emailHelp" class="form-text">Format: YYYY-MM-DD</div>
                            <p>Event Date : ${new Date(event.Event_date).toLocaleDateString()}</p>
                            <p>Event Type : ${event.Event_type}</p>
                        </p>
                        </div>
                        <div class="card-footer">
                        <div class="form-text">Click on the box to get more Details and Payment.</div>
                    </div>
                `;

                container.appendChild(card);
            });
        } else {
            if (response.status === 401 || response.status === 403) {
                sessionStorage.clear();
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Your session has expired. Please login again.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Login'
                }).then((result) => {
                    if(result.isConfirmed){
                        window.location.href = "../Login_Folder/Login.html";
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Server is not working , Please try again later',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
    }
}

// let bsModal = null;
async function showDetails(event) {
    // Set modal title
    document.getElementById('eventDetailModalLabel').textContent = ' " ' + event.Event_name + ' " ' + ' Event  Details';

    // conditional fee line
    const feeLine = event.Event_payment === "Paid"
        ? `<p><strong>Fees Per Person:</strong> ₹${event.Event_feesPerPerson}</p>`
        : "";

    // Set modal body content
    const modalBody = document.querySelector('#eventDetailModal .modal-body');
    modalBody.innerHTML = `
        <img src="${event.Event_Poster}" class="img-fluid mb-3" alt="${event.Event_name}">
        <p><strong>Event Name:</strong> ${event.Event_name}</p>
        <p><strong>Organizer:</strong> ${event.Event_hoster_emailid}</p>
        <p><strong>Enrollment No:</strong> ${event.Event_hoster_enrollementNo}</p>
        <p><strong>Contact No:</strong> ${event.Event_hoster_ContactNo}</p>
        <p><strong>Hoster Branch:</strong> ${event.Event_hoster_branch}</p>
        <p><strong>Date:</strong> ${new Date(event.Event_date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.from_time} to  ${event.to_time}</p>
        <p><strong>Location:</strong> ${event.Event_location}</p>
        <p><strong>Event Type:</strong> ${event.Event_type}</p>
        <p><strong>Payment:</strong> ${event.Event_payment}</p>
        ${feeLine}
        <p><strong>Description:</strong> ${event.Event_description}</p>
        <div class="text-center mt-4">
            <button id="modalEnrollBtn" class="btn btn-success">Enroll Now</button>
        </div>
    `;

    // Attach enroll button event
    document.getElementById('modalEnrollBtn').addEventListener('click', async () => {
        const result = await Swal.fire({
            title: `Enroll in ${event.Event_name}?`,
            text: "Are you sure you want to enroll in this event?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, enroll me!",
            cancelButtonText: "No, cancel"
        })

        if (result.isConfirmed) {
            const UserData = await getUserData();
            await EnrollProcess(event, UserData);
        } else {
            Swal.fire("Cancelled", "You were not enrolled.", "info");
        }
    });

    // Show the modal
    const eventModal = document.getElementById('eventDetailModal');
    if (!bsModal) {
        bsModal = new bootstrap.Modal(eventModal);
    }
    bsModal.show();

}

async function getUserData() {
    try {
        const response = await fetch("https://vgec-eventmanagement-backend.onrender.com/getUserProfile", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const userData = await response.json();

        if (response.ok) {
            return userData;
        } else {
            if (response.status === 401 || response.status === 403) {
                sessionStorage.clear();
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Your session has expired. Please login again.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Login'
                }).then((result) => {
                    if(result.isConfirmed){
                        window.location.href = "../Login_Folder/Login.html";
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Server is not working , Please try again later',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
    }
}

async function EnrollProcess(event, UserData) {
    try {
        const response = await fetch("https://vgec-eventmanagement-backend.onrender.com/ParticipateStudent", {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ UserData, event }),
            credentials: "include"
        });

        if (response.ok) {
            const result = await response.json();
            Swal.fire({
                icon: 'success',
                title: 'Enrollment Successful!',
                text: 'You have been successfully enrolled. Confirmation has been sent to your email.',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'OK'
            });
            
            document.getElementById("CloseButtonForDetailModal").click();

            setTimeout(()=>{
                location.reload();
            },2500);
        } else {
            const errorData = await response.json();
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorData.message,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'OK'
            });
            if (response.status === 401 || response.status === 403) {
                sessionStorage.clear();
                Swal.fire({
                    icon: 'error',
                    title: 'Session Expired',
                    text: 'Your session has expired. Please login again.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Login'
                }).then((result) => {
                    if(result.isConfirmed){
                        window.location.href = "../Login_Folder/Login.html";
                    }
                });
            }
        }
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Server Error',
            text: 'Server is not working , Please try again later',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
    }
}

