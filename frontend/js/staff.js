const staffMembers = [
    {
        name: "Nimal Perera",
        username: "nimalp",
        email: "nimal@store.com",
        role: "Staff",
        status: "Active"
    },
    {
        name: "Kamala Silva",
        username: "kamalas",
        email: "kamala@store.com",
        role: "Staff",
        status: "Active"
    }
];

const staffTableBody = document.getElementById("staffTableBody");

staffMembers.forEach(function (staff) {

    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${staff.name}</td>
        <td>${staff.username}</td>
        <td>${staff.email}</td>
        <td>${staff.role}</td>
        <td>${staff.status}</td>
        <td>
            <button class="edit-btn">Edit</button>
            <button class="deactivate-btn">Deactivate</button>
        </td>
    `;

    staffTableBody.appendChild(row);
});


const deactivateButtons = document.querySelectorAll(".deactivate-btn");

deactivateButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const confirmed = confirm("Are you sure you want to deactivate this staff account?");

        if (confirmed) {
    const row = button.closest("tr");
    const statusCell = row.querySelector("td:nth-child(5)");

    statusCell.textContent = "Inactive";
}
    });
});