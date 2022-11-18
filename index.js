const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/"; //+id

const dataPanel = document.querySelector("#data-panel");
const modal = document.querySelector("#user-modal");
const page = document.querySelector('#navigator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const hide = document.querySelector('.hide')
const submit = document.querySelector('#search-submit-button')

//中間一些繁雜的註解就不刪了，紀錄一下思考的過程XD

// const usersLikeList = [];
// const numberOfData = 200; //不知道怎麼抓出axios回應的資料量，姑且直接輸入
const users = [];
let filterUsers = []
const usersPerPage = 12
//不太能確定非同步影響的情況，先試著把每件事分開做，以function裝起來

apiIndexRequest(); //有確實執行，但不知道花多久?

// renderUsersListOfAPI(users); //在函式外執行，因非同步所以無法渲染?

//點擊照片跳出Modal
dataPanel.addEventListener("click", onAvatarClick);
//點擊收藏可收藏User
modal.addEventListener("click", addToFavorites);
//點擊搜尋送出表單可篩選User
searchForm.addEventListener('submit',searchUser)
//點擊Page可重新渲染頁面
page.addEventListener('click', pageClick)

function apiIndexRequest() {
  // for (let i = 0; i < numberOfData; i++) {
  //   usersLikeList.push(0);
  // }

  axios.get(INDEX_URL).then((res) => {
    for (const user of res.data.results) {
      users.push(user);
    }
    renderUsersList(userOfPage(1)); //在函式內執行，確保有取到資料 //預設顯示第一頁
    renderPage(users)
    // console.log(users[0].id)
  });
}

function renderUsersList(data) {
  let rawHTML = "";
  for (let item of data) {
    // const rawLike = [item.id, 0];
    // likeCount.push(rawLike);
    rawHTML += `
    <div class="col-sm-3">
      <div class="m-4">
        <div class="card bg-dark text-white">
          <img src="${item.avatar}" class="card-img" alt="avatar" data-id="${item.id}" " data-bs-toggle="modal" data-bs-target="#user-modal">
          <div class="card-body">
            <p class="card-text fs-6">${item.name} ${item.surname}
            </p>
          </div>
        </div>
      </div>  
    </div>
    `;
  }
  dataPanel.innerHTML = rawHTML;
}

function onAvatarClick(event) {
  const target = event.target;
  if (target.matches(".card-img")) {
    const id = Number(target.dataset.id);
    showUserModal(id);
  }
}

//之前寫好的like功能，稍微改一下當作收藏功能
function addToFavorites(event) {
  const target = event.target;
  if (target.matches(".favorite")) {
    // console.log(target.parentElement.parentElement.children[0].textContent)
    // const index =
    //   Number(target.parentElement.parentElement.children[0].textContent) - 601;
    // users[index].like++;
    const id = Number(target.parentElement.parentElement.children[0].textContent)
    const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const user = users.find(user => user.id === id)
    if (list.some(user => user.id === id)) {
      return alert('此用戶已在收藏名單中！') 
    }
    list.push(user)
    localStorage.setItem('favoriteUsers', JSON.stringify(list))
  }
}

function showUserModal(id) {
  const modalId = document.querySelector("#user-modal-id");
  const userName = document.querySelector("#user-modal-name");
  const userGender = document.querySelector("#user-modal-gender");
  const userAge = document.querySelector("#user-modal-age");
  const userBirthday = document.querySelector("#user-modal-birthday");
  const userRegion = document.querySelector("#user-modal-region");
  const userEmail = document.querySelector("#user-modal-email");
  // const userLike = document.querySelector("#user-modal-like");

  userName.innerHTML = '<b><em> Name </em></b>';
  userGender.textContent = 'Gender : ';
  userAge.textContent = 'Age : ';
  userBirthday.textContent = 'Birthday : ';
  userRegion.textContent = 'Region : ';
  userEmail.textContent = 'Email : ';
  // userLike.textContent = 'Like : ';


  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalId.textContent = id;
    // const index = id - 601;
    userName.innerHTML = `<b><em>${data.name} ${data.surname}</em></b>`;
    userGender.textContent = `Gender : ${data.gender}`;
    userAge.textContent = `Age : ${data.age}`;
    userBirthday.textContent = `Birthday : ${data.birthday}`;
    userRegion.textContent = `Region : ${data.region}`;
    userEmail.textContent = `Email : ${data.email}`;
    // userLike.textContent = `Like : ${users[index].like}`;
  });
}


function searchUser(event){
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filterUsers = users.filter(function(user){
    return user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  })
  if (filterUsers.length === 0) {
    return alert(`您輸入的姓或名：${keyword} ，沒有符合條件的使用者`)
  }
  //渲染出搜尋結果資料中的第一頁
  renderUsersList(userOfPage(1))
  //渲染出搜尋結果應有頁數
  renderPage(filterUsers)
  //搜尋欄目清空
  if (keyword.length !== 0) {
    hide.classList.add('d-none')
    submit.textContent = 'Back'
  } else {
    hide.classList.remove('d-none')
    submit.textContent = 'Search'
  }
  searchInput.value = null
}

//引入資料應有頁數
function renderPage(data){
  const number = Math.ceil(data.length / usersPerPage)
  let rawHTML = ''
  for (let i = 1; i <= number; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  page.innerHTML = rawHTML
}

//按照頁數切割出12個使用者資料
function userOfPage(page){  
  const start = (page - 1) * usersPerPage 
  const user = filterUsers.length ? filterUsers : users
  return user.slice(start, start + usersPerPage)
}

//點擊後取得page資料，引入userOfPage並呼叫renderUsersList重新渲染
function pageClick(event){
  const target = event.target
  if (target.tagName !== 'A') return
  const page = Number(target.dataset.page)
  renderUsersList(userOfPage(page))
}

