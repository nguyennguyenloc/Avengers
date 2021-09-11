var listcomment = new ListComment();

//tự động lấy dữ liệu từ storage khi load trang
GetStorage();

//Thêm phương thức
function DomID(id) {
    var element = document.getElementById(id);
    return element;
}

function AddList() {
    //lấy dữ liệu từ người dung nhập vào
    var binhluan = DomID("binhluan").value;
    var hoten = DomID("hoten").value;

    var sinhvien = new Comment(hoten,binhluan);
    listcomment.AddList(sinhvien);
    CapNhatDanhSach(listcomment);
    // console.log(listcomment);
}


function CapNhatDanhSach(ListComment) {
    var lstTableSV = DomID("tbodySinhVien");
    lstTableSV.innerHTML = "";
    for (var i = 0; i < ListComment.list.length; i++) {
        // lấy thông tin sv từ trong mảng sv
        // var sv = danhSachSinhVien.DSSV[i];
        var sv = ListComment.list[i];
        //tạo thẻ tr, số tr = số sv
        var trSinhVien = document.createElement("tr");
        trSinhVien.id = sv.hoten;
        trSinhVien.className = "trSinhVien";
        // trSinhVien.setAttribute("onclick", "ChinhSuaSinhVien('" + sv.MaSV + "')");
        //tạo các thẻ td và filter dữ liệu sv thứ [i] vào
        var tdCheckBox = document.createElement('td');
        var ckbMaSinhVien = document.createElement('input');
        // console.log(ckbMaSinhVien);
        //setAttribute là các thuộc tính của thẻ
        // ckbMaSinhVien.setAttribute("class", "ckbMaSV");
        // ckbMaSinhVien.setAttribute("type", "checkbox");
        // ckbMaSinhVien.setAttribute("value", sv.MaSV);
        tdCheckBox.appendChild(ckbMaSinhVien);
        var tdDate = TaoTheTD("ngay", sv.DateNow);
        var tdHoTen = TaoTheTD("hoten", sv.NameComment);
        var tdMaSV = TaoTheTD("binhluan", sv.ContentComment);

        //Append các thẻ td vào tr
        trSinhVien.appendChild(tdDate);
        trSinhVien.appendChild(tdHoTen);
        trSinhVien.appendChild(tdMaSV);

        //Append các tr và tbodySinhVien
        lstTableSV.appendChild(trSinhVien);
        SetStorage();
    }
}

function TaoTheTD(className, value) {
    var td = document.createElement("td");
    td.className = className;
    td.innerHTML = value;
    return td;
}

function SetStorage() {
    //biến dssv thành chuỗi rồi lưu vào storage
    var jsonDanhSach = JSON.stringify(listcomment.list);
    //luu chuoi dssv vao "DanhSachSV"
    localStorage.setItem("DanhSach", jsonDanhSach);
}

function GetStorage() {
    //lấy chuỗi ra
    var jsonDanhSach = localStorage.getItem("DanhSach");
    //biến chuỗi lấy ra thành mảng dssv
    var mangDS = JSON.parse(jsonDanhSach);
    listcomment.list = mangDS;
    CapNhatDanhSach(listcomment);
}
