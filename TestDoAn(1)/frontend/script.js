document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("route").addEventListener("change", updatePickupAndDropOffPoints);
});

// 🔹 Khi chọn tuyến, tự động lấy danh sách điểm đón & điểm đến
function updatePickupAndDropOffPoints() {
    const route = document.getElementById("route").value;

    if (!route) return; // Nếu chưa chọn tuyến, không làm gì cả

    fetch(`http://localhost:3000/api/trips/pickup-points?route=${route}`)
        .then(response => response.json())
        .then(data => {
            if (data.pickupPoints && data.dropOffPoints) {
                updateDatalist("pickupPoints", data.pickupPoints);
                updateDatalist("dropOffPoints", data.dropOffPoints);
            } else {
                console.error("❌ Không tìm thấy dữ liệu điểm đón và điểm đến!");
            }
        })
        .catch(error => console.error("❌ Lỗi khi tải điểm đón & điểm đến:", error));
}

// 🔹 Hàm cập nhật danh sách gợi ý
function updateDatalist(datalistId, items) {
    const dataList = document.getElementById(datalistId);
    dataList.innerHTML = ""; // Xóa danh sách cũ
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item;
        dataList.appendChild(option);
    });
}

// 🔹 Bắt sự kiện tìm chuyến xe
document.getElementById("searchForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const route = document.getElementById("route").value;
    const date = document.getElementById("date").value.trim();

    if (!route || !date) {
        alert("Vui lòng chọn tuyến đường và ngày đi!");
        return;
    }

    fetch(`http://localhost:3000/api/trips?route=${encodeURIComponent(route)}&date=${encodeURIComponent(date)}`)
        .then(response => response.json())
        .then(data => displayTrips(data))
        .catch(error => console.error("❌ Lỗi khi tải danh sách chuyến xe:", error));
});

// 🔹 Hiển thị danh sách chuyến xe
function displayTrips(trips) {
    const tripResults = document.getElementById("tripResults");
    tripResults.innerHTML = ""; // Clear previous results

    if (trips.length > 0) {
        trips.forEach(trip => {
            const tripCard = document.createElement("div");
            tripCard.className = "trip-card";

            tripCard.innerHTML = `
                <div class="trip-info">
                    <h5 class="text-primary">🚌 ${trip.departure} - ${trip.destination}</h5>
                    <p>📅 Ngày: <strong>${trip.date}</strong></p>
                    <p>⏰ Giờ: <strong>${trip.time}</strong></p>
                    <p>💰 Giá vé: <strong>${trip.price.toLocaleString()} VND</strong></p>
                </div>
                <button class="btn btn-success btn-book" data-trip='${JSON.stringify(trip)}'>Chọn chuyến</button>
            `;

            tripResults.appendChild(tripCard);
        });

        // Thêm sự kiện khi nhấn "Chọn chuyến"
        document.querySelectorAll(".btn-book").forEach(button => {
            button.addEventListener("click", function() {
                const tripData = JSON.parse(this.getAttribute("data-trip"));
                bookTrip(tripData);
            });
        });

    } else {
        tripResults.innerHTML = '<p class="text-danger text-center">🚫 Không có chuyến xe nào.</p>';
    }
}



// 🔹 Xử lý đặt vé (sửa lại hiển thị chi tiết chuyến xe)
function bookTrip(trip) {
    alert(`Bạn đã chọn chuyến xe:\n🚌 ${trip.route}\n📅 Ngày: ${trip.date}\n⏰ Giờ: ${trip.time}\n💰 Giá vé: ${trip.price.toLocaleString()} VND`);
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("📢 Script đã tải xong!");
});


// 🔹 Khi bấm "Chọn chuyến", mở modal chọn ghế
document.addEventListener("click", function(e) {
    if (e.target.classList.contains("btn-book")) {
        const tripData = JSON.parse(e.target.getAttribute("data-trip"));
        openSeatSelection(tripData);
    }
});

// 🔹 Hiển thị danh sách ghế ngồi theo sơ đồ thực tế
function openSeatSelection(trip) {
    console.log("Mở modal ghế ngồi cho chuyến:", trip); // Debug xem có nhận đúng dữ liệu chuyến không

    document.getElementById("seatModal").style.display = "block";
    const seatContainer = document.getElementById("seatContainer");
    seatContainer.innerHTML = ""; // Xóa danh sách ghế cũ

    // 🔹 Gán dữ liệu chuyến đi vào nút "Tiếp tục"
    const continueButton = document.getElementById("continueBooking");
    continueButton.setAttribute("data-trip", JSON.stringify(trip));

    // 🔹 Gọi API để lấy danh sách ghế đã đặt
    fetch(`http://localhost:3000/api/trips/bookings?tripId=${trip._id}`)
        .then(response => response.json())
        .then(data => {
            const bookedSeats = data.bookedSeats || []; // Nếu chưa có, mặc định mảng rỗng
            console.log("Ghế đã đặt:", bookedSeats); // Debug danh sách ghế đã đặt

            // 🔹 Sơ đồ ghế xe theo yêu cầu
            const seatLayout = [
                [null, null, 1, 2], // Hàng 1: 2 ghế bên phải
                [3, 4, 5], // Hàng 2: 3 ghế bên trái
                [6, 7, 8], // Hàng 3: 3 ghế bên trái
                [9, 10, 11], // Hàng 4: 3 ghế bên trái
                [12, 13, 14, 15] // Hàng 5: 4 ghế cuối
            ];

            seatLayout.forEach(row => {
                const rowContainer = document.createElement("div");
                rowContainer.classList.add("row-container");

                row.forEach(seat => {
                    if (seat === null) {
                        const emptySpace = document.createElement("div");
                        emptySpace.classList.add("empty-space");
                        rowContainer.appendChild(emptySpace);
                    } else {
                        const seatElement = document.createElement("button");
                        seatElement.innerText = seat;
                        seatElement.classList.add("seat");

                        if (bookedSeats.includes(seat.toString())) {
                            seatElement.classList.add("booked");
                            seatElement.disabled = true; // Ghế đã đặt không thể chọn
                        } else {
                            seatElement.addEventListener("click", () => toggleSeatSelection(seat, seatElement));
                        }

                        rowContainer.appendChild(seatElement);
                    }
                });

                seatContainer.appendChild(rowContainer);
            });
        })
        .catch(error => console.error("❌ Lỗi khi tải danh sách ghế đã đặt:", error));
}



// 🔹 Cho phép chọn nhiều ghế
let selectedSeats = new Set();

function toggleSeatSelection(seatNumber, seatElement) {
    if (selectedSeats.has(seatNumber)) {
        selectedSeats.delete(seatNumber);
        seatElement.classList.remove("selected");
    } else {
        selectedSeats.add(seatNumber);
        seatElement.classList.add("selected");
    }
}

// 🔹 Nút quay lại từ modal xác nhận đặt vé về modal chọn ghế
document.getElementById("backButton").addEventListener("click", function() {
    // Ẩn modal xác nhận đặt vé
    document.getElementById("confirmationModal").style.display = "none";

    // Hiển thị modal chọn ghế
    document.getElementById("seatModal").style.display = "block";
});

// 🔹 Nút tiếp tục trong modal chọn ghế - chuyển đến modal xác nhận đặt vé
document.getElementById("continueBooking").addEventListener("click", function() {
    if (selectedSeats.size === 0) {
        alert("Vui lòng chọn ít nhất một ghế!");
        return;
    }

    // Lấy thông tin chuyến đi từ data-trip
    const trip = JSON.parse(this.getAttribute("data-trip"));
    const selectedSeatsArray = Array.from(selectedSeats);

    // Hiển thị thông tin xác nhận đặt vé
    document.getElementById("confirmationTripInfo").innerText = `Tuyến: ${trip.route} | Ngày đi: ${trip.date} | Giờ: ${trip.time}`;
    document.getElementById("selectedSeats").innerText = `Ghế đã chọn: ${selectedSeatsArray.join(", ")}`;
    document.getElementById("totalPrice").innerText = `Tổng giá: ${selectedSeatsArray.length * 200000} VND`; // Ví dụ tính giá

    // Mở modal xác nhận
    document.getElementById("seatModal").style.display = "none";
    document.getElementById("confirmationModal").style.display = "block";
});




// 🔹 Xác nhận đặt vé
document.getElementById("confirmBooking").addEventListener("click", function() {
    const trip = JSON.parse(this.getAttribute("data-trip")); // Lấy thông tin chuyến xe
    const phoneNumber = document.getElementById("phoneNumber").value.trim(); // Lấy số điện thoại
    const customerName = document.getElementById("fullName").value.trim(); // Lấy tên khách hàng
    const selectedSeatsArray = Array.from(selectedSeats); // Lấy danh sách ghế đã chọn

    // Kiểm tra nếu thiếu thông tin bắt buộc
    if (!phoneNumber || !customerName || selectedSeatsArray.length === 0) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // Lưu thông tin đặt vé vào đối tượng bookingData
    const bookingData = {
        tripId: trip._id, // Đảm bảo tripId được lấy từ chuyến đã chọn
        customerName: customerName,
        customerPhone: phoneNumber,
        bookedSeats: selectedSeatsArray,
        paymentStatus: 'pending' // Trạng thái thanh toán mặc định
    };

    // Gửi dữ liệu đặt vé đến server (backend)
    fetch("http://localhost:3000/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(bookingData)
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(`⚠️ ${data.message}`);
            } else {
                // Nếu đặt vé thành công
                alert(`✅ Đặt vé thành công!\n📍 Ghế: ${bookingData.bookedSeats.join(", ")}\n📞 SĐT: ${bookingData.customerPhone}`);

                // Cập nhật lại thông tin cho modal xác nhận
                document.getElementById("confirmationTripInfo").innerText = `Tuyến: ${bookingData.trip.route} | Ngày đi: ${bookingData.trip.date} | Giờ: ${bookingData.trip.time}`;
                document.getElementById("selectedSeats").innerText = `Ghế đã chọn: ${bookingData.bookedSeats.join(", ")}`;
                document.getElementById("totalPrice").innerText = `Tổng giá: ${bookingData.bookedSeats.length * 200000} VND`; // Ví dụ tính giá

                // Ẩn modal xác nhận và hiển thị modal thanh toán
                document.getElementById("confirmationModal").style.display = "none"; // Ẩn modal xác nhận
                document.getElementById("paymentModal").style.display = "block"; // Hiển thị modal thanh toán
            }
        })
        .catch(error => {
            console.error("❌ Lỗi khi gửi dữ liệu đặt vé:", error);
            alert("Lỗi khi gửi yêu cầu đặt vé.");
        });
});


// 🔹 Nút đóng modal chọn ghế
document.getElementById("closeModal").addEventListener("click", function() {
    // Ẩn modal chọn ghế khi bấm đóng
    document.getElementById("seatModal").style.display = "none";
});


document.addEventListener("DOMContentLoaded", function() {
    // 🔹 Khi nhấn "Xác nhận đặt vé" từ form
    document.getElementById("contactForm").addEventListener("submit", function(e) {
        e.preventDefault(); // Ngừng hành động mặc định của form

        // Lấy thông tin khách hàng từ form
        const fullName = document.getElementById("fullName").value.trim();
        const phoneNumber = document.getElementById("phoneNumber").value.trim();
        const email = document.getElementById("email").value.trim();

        // Kiểm tra các trường thông tin bắt buộc
        if (!fullName || !phoneNumber || !email) {
            alert("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Kiểm tra nếu không có ghế đã chọn
        if (selectedSeats.size === 0) {
            alert("Vui lòng chọn ít nhất một ghế!");
            return;
        }

        // Lưu thông tin đặt vé vào đối tượng bookingData
        const bookingData = {
            customerName: fullName,
            customerPhone: phoneNumber,
            customerEmail: email,
            bookedSeats: Array.from(selectedSeats), // Danh sách ghế đã chọn
            tripId: JSON.parse(document.getElementById("continueBooking").getAttribute("data-trip"))._id, // Dữ liệu chuyến đi (tripId)
            paymentStatus: 'pending', // Trạng thái thanh toán mặc định
        };

        // Gửi dữ liệu đặt vé đến server (backend)
        fetch("http://localhost:3000/api/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(bookingData) // Gửi dữ liệu booking
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(`⚠️ ${data.message}`);
                } else {
                    // Nếu đặt vé thành công
                    alert(`✅ Đặt vé thành công!\n📍 Ghế: ${bookingData.bookedSeats.join(", ")}\n📞 SĐT: ${bookingData.customerPhone}`);

                    // Cập nhật lại thông tin cho modal xác nhận
                    const trip = JSON.parse(document.getElementById("continueBooking").getAttribute("data-trip"));
                    document.getElementById("confirmationTripInfo").innerText = `Tuyến: ${trip.departure} - ${trip.destination} | Ngày đi: ${trip.date} | Giờ: ${trip.time}`;
                    document.getElementById("selectedSeats").innerText = `Ghế đã chọn: ${bookingData.bookedSeats.join(", ")}`;
                    document.getElementById("totalPrice").innerText = `Tổng giá: ${bookingData.bookedSeats.length * 200000} VND`; // Ví dụ tính giá

                    // Ẩn modal xác nhận và hiển thị modal thanh toán
                    document.getElementById("confirmationModal").style.display = "none"; // Ẩn modal xác nhận
                    document.getElementById("paymentModal").style.display = "block"; // Hiển thị modal thanh toán
                }
            })
            .catch(error => {
                console.error("❌ Lỗi khi gửi dữ liệu đặt vé:", error);
                alert("Lỗi khi gửi yêu cầu đặt vé.");
            });
    });

    // 🔹 Đóng modal thanh toán
    document.getElementById("closePaymentModal").addEventListener("click", function() {
        document.getElementById("paymentModal").style.display = "none"; // Đóng modal thanh toán
    });

    // 🔹 Xử lý khi bấm "Thanh toán" trong modal thanh toán
    document.getElementById("paymentForm").addEventListener("submit", function(event) {
        event.preventDefault();

        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if (!selectedPaymentMethod) {
            alert("Vui lòng chọn phương thức thanh toán!");
            return;
        }

        const paymentMethod = selectedPaymentMethod.value;
        alert(`Thanh toán qua phương thức: ${paymentMethod}`);
        alert("Thanh toán thành công!");

        // Sau khi thanh toán thành công, bạn có thể thực hiện các thao tác như chuyển hướng hoặc thông báo thành công
        window.location.href = "/"; // Ví dụ: quay về trang chủ
    });
});






// Đóng modal thanh toán
document.getElementById("closePaymentModal").addEventListener("click", function() {
    document.getElementById("paymentModal").style.display = "none";
});

window.onload = function() {
    // Kiểm tra xem phần tử paymentModal có tồn tại hay không
    const paymentModal = document.getElementById("paymentModal");
    console.log(paymentModal); // In ra phần tử paymentModal trong console

    if (paymentModal) {
        console.log("Modal thanh toán đã được tìm thấy trong DOM!");
    } else {
        console.log("Không tìm thấy modal thanh toán trong DOM!");
    }
};

// Kiểm tra nếu người dùng đã đăng nhập, nếu có thì hiển thị tên người dùng và nút đăng xuất
// Kiểm tra nếu người dùng đã đăng nhập
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem('loggedInUser')); // Lấy thông tin người dùng từ localStorage

    if (user) {
        // Nếu người dùng đã đăng nhập, hiển thị tên người dùng và nút đăng xuất
        document.getElementById('userName').innerText = `Xin chào, ${user.username}`;
        document.getElementById('userName').style.display = 'block'; // Hiển thị tên người dùng
        document.getElementById('logoutBtn').style.display = 'block'; // Hiển thị nút đăng xuất
        document.getElementById('loginBtn').style.display = 'none'; // Ẩn nút đăng nhập
        document.getElementById('registerBtn').style.display = 'none'; // Ẩn nút đăng ký
    } else {
        // Nếu chưa đăng nhập, hiển thị nút đăng nhập và đăng ký
        document.getElementById('userName').style.display = 'none'; // Ẩn tên người dùng
        document.getElementById('logoutBtn').style.display = 'none'; // Ẩn nút đăng xuất
        document.getElementById('loginBtn').style.display = 'block'; // Hiển thị nút đăng nhập
        document.getElementById('registerBtn').style.display = 'block'; // Hiển thị nút đăng ký
    }

    // Xử lý đăng xuất
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('loggedInUser'); // Xóa thông tin người dùng khỏi localStorage
        localStorage.removeItem('token'); // Xóa token đăng nhập
        window.location.href = 'index.html'; // Điều hướng về trang chính sau khi đăng xuất
    });
});



// Kiểm tra nếu người dùng đã đăng nhập và hiển thị tên và quyền
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
const userInfo = document.getElementById('user-info');

if (loggedInUser) {
    const username = loggedInUser.username;
    const role = loggedInUser.role;

    userInfo.innerHTML = `Xin chào, ${username} (${role})`;
}