const dataPanel = document.querySelector("#data-panel");
const modal = document.querySelector("#user-modal");
const page = document.querySelector('#navigator')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const hide = document.querySelector('.hide')
const submit = document.querySelector('#search-submit-button')


const users = JSON.parse(localStorage.getItem('favoriteUsers'));
let filterUsers = []
const usersPerPage = 12

renderUsersList(userOfPage(1))
renderPage(users)

//點擊照片跳出Modal
dataPanel.addEventListener("click", onAvatarClick);
//點擊刪除可刪除User
modal.addEventListener("click", removeFavorite);
//點擊搜尋送出表單可篩選User
searchForm.addEventListener('submit',searchUser)
//點擊Page可重新渲染頁面
page.addEventListener('click', pageClick)


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

function removeFavorite(event){
  if (!users || !users.length) return
  const target = event.target
  if(target.matches('.remove')){
    const id = Number(target.parentElement.parentElement.children[0].textContent)
    const index = users.findIndex(function(user){
      return user.id === id
    })
    if( index===-1 ) return
    users.splice(index,1)

    if (!filterUsers || !filterUsers.length){ //在收藏首頁執行刪除
      renderPage(users)
    }else{ //若在執行搜尋後的頁面執行刪除，會維持在搜尋結果頁面，直到重整頁面或按下返回
      const filterIndex = filterUsers.findIndex(function (user) {
        return user.id === id
      })
      if (filterIndex === -1) return
      filterUsers.splice(filterIndex, 1) 
      renderPage(filterUsers)
      if(!filterUsers.length){
        hide.classList.remove('d-none')
        submit.textContent = 'Search'
      }
      
    }
    localStorage.setItem('favoriteUsers', JSON.stringify(users))
    renderUsersList(userOfPage(1))
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
  const data = users.find(function(user){
    return user.id === id
  })
    modalId.textContent = id;
    userName.innerHTML = `<b><em>${data.name} ${data.surname}</em></b>`;
    userGender.textContent = `Gender : ${data.gender}`;
    userAge.textContent = `Age : ${data.age}`;
    userBirthday.textContent = `Birthday : ${data.birthday}`;
    userRegion.textContent = `Region : ${data.region}`;
    userEmail.textContent = `Email : ${data.email}`;
  ;
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
  renderUsersList(userOfPage(1))
  renderPage(filterUsers)
  if(keyword.length!==0){
    hide.classList.add('d-none')
    submit.textContent = 'Back'   
  }else{
    hide.classList.remove('d-none')
    submit.textContent = 'Search'
  }
  searchInput.value = null
  // filterUsers = [] 
}

function renderPage(data){
  const number = Math.ceil(data.length / usersPerPage)
  let rawHTML = ''
  for (let i = 1; i <= number; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
  }
  page.innerHTML = rawHTML
}

function userOfPage(page){  
  const start = (page - 1) * usersPerPage 
  const user = filterUsers.length ? filterUsers : users
  return user.slice(start, start + usersPerPage)
}


function pageClick(event){
  const target = event.target
  if (target.tagName !== 'A') return
  const page = Number(target.dataset.page)
  renderUsersList(userOfPage(page))
}

