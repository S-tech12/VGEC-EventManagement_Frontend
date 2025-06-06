document.addEventListener("DOMContentLoaded", FillTable);

async function FillTable() {
    const PendingTableBody = document.querySelector("#PendingTableBody tbody");
    const NoOfEvent0 = document.getElementById("NoOfEvent0");
    // we have to access the tbody not the whole table

    if (!token) {
        Swal.fire({
            icon: 'error',
            title: 'Authentication Error',
            text: 'Please login first!',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'OK'
        });
        window.location.href = "../Login_Folder/Login.html";
        return;
    }

    try {
        const response = await fetch("https://vgec-eventmanagement-backend.onrender.com/getEventData", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const eventData = await response.json();

        if (response.ok) {
            const events = eventData.result;

            // Clear any existing table rows
            PendingTableBody.innerHTML = "";

            if (events.length === 0) {
                PendingTableBody.innerHTML = "<tr><td colspan='5'>No events found.</td></tr>";
                NoOfEvent0.innerHTML = `You have not hosted any event yet if you want to host the event than in the dashaboard there is the button to host the new event!!`;
                return;
            }

            NoOfEvent0.innerHTML = `You have hosted <strong>${events.length}</strong> events. Below is the list of events which are pending.`;

            events
                .filter(event => event.Event_Status === "Pending")
                .forEach((event, index) => {
                    const row = document.createElement("tr");

                    row.innerHTML = `
                        <th scope="row">${index + 1}</th>
                        <td>${event.Event_name}</td>
                        <td>${event.Event_type}</td>
                        <td>${new Date(event.Event_date).toISOString().split('T')[0]}</td>
                        <td>
                            <span class="text-warning">
                                <b><i class="bi bi-circle-fill"></i> Pending</b>
                            </span>
                        </td>
                        <td>${event.Reuired_permission_HOD_emailid}</td>
                    `;

                    PendingTableBody.appendChild(row);
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
