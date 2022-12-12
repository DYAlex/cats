const $wr = document.querySelector('.data-wr')

const getCatHTML = (cat) => {
	let like = "like"
	if (cat.favorite) {
		like += " liked"
	}
	return `
	<div class="card" id="cat_${cat.id}">
		<img src="${cat.image}" class="card-img" alt="${cat.name}" />
		<div class="card-body">
			<h5 class="card-title">${cat.name}</h5>
			<p class="card-text modal-text">
				<span class="bold">Возраст:</span> ${cat.age}
			</p>
			<p class="card-text modal-text">
				<span class="bold">Рейтинг:</span> ${cat.rate}
			</p>
			<p class="card-text modal-text">
				<span class="bold">ID:</span> ${cat.id}
			</p>
			<p class="card-text">
				<span class="bold modal-text">Обо мне: </span>${cat.description}
			</p>
		</div>
		<p class="card-likes-wrapper"><i class="fa-regular fa-heart ${like}"></i></p>
	</div>
	`
}

const openModal = (e) => {
	console.log(e.currentTarget);
	const modal = e.currentTarget;
	modal.querySelectorAll(".modal-text").forEach((text) => text.classList.toggle("modal-text_active"));
	modal.querySelector(".card-body").classList.toggle("modal-spacing");
	modal.classList.toggle("modal");
	// console.log(modal.children);
}

const handleForm = (e) => {
	// console.log(e.currentTarget);
	const formWrapper = document.querySelector(".form-wrapper");
	formWrapper.classList.toggle("modal");
	formWrapper.classList.toggle("hidden");
	const closeBtn = document.querySelector("#close-btn");
	closeBtn.addEventListener("click", handleForm);
}

fetch('https://cats.petiteweb.dev/api/single/DYAlex/show/')
	.then((res) => res.json())
	.then((data) => {
		$wr.insertAdjacentHTML('afterbegin', data.map(cat => getCatHTML(cat)).join('') )
		// console.log({data})
	})
	.then(() => {
		document.querySelectorAll(".card").forEach((card) => card.addEventListener("click", openModal));
		document.querySelector("#add-cat").addEventListener("click", handleForm);
	})