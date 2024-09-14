
function ad(){
  document.addEventListener('click', (e) => {
    if (e.target instanceof HTMLButtonElement) {
      const button = e.target;
      const text = button.getAttribute('data-copy');
      navigator.clipboard.writeText(text);
    }
  })
}

class Person{
  b = 0;
  add(){

  }
}
