<script>
  import { createEventDispatcher } from "svelte";
  let selected = 1;
  let dispatch = createEventDispatcher();

  const onChange = (e) => {
    selected = e.currentTarget.value;
    dispatch("priority-no", selected);
  };
</script>

<div class="t-head">Task Priority</div>
<ul class="option__container">
  <li class="option__box">
    <input type="radio" checked={selected === 1} name="priority" value="1" id="option-1" on:change={onChange} />
    <label for="option-1">1</label>
  </li>
  <li class="option__box">
    <input type="radio" checked={selected === 2} name="priority" value="2" id="option-2" on:change={onChange} />
    <label for="option-2">2</label>
  </li>
  <li class="option__box">
    <input type="radio" checked={selected === 3} name="priority" value="3" id="option-3" on:change={onChange} />
    <label for="option-3">3</label>
  </li>
  <li class="option__box">
    <input type="radio" checked={selected === 4} name="priority" value="4" id="option-4" on:change={onChange} />
    <label for="option-4">4</label>
  </li>
  <li class="option__box">
    <input type="radio" checked={selected === 5} name="priority" value="5" id="option-5" on:change={onChange} />
    <label for="option-5">5</label>
  </li>
</ul>

<style>
  .option__container {
    list-style: none;
    margin: 13px auto;
    display: flex;
    max-width: 300px;
  }
  .option__box {
    margin: 2px 5px;
  }
  .option__box label {
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #ebebeb;
    box-shadow: rgb(0 0 0 / 12%) 0px 1px 3px, rgb(0 0 0 / 24%) 0px 1px 2px;
    transition: background 0.3s ease-in-out;
  }
  [type="radio"] {
    opacity: 0;
    position: absolute;
  }
  [type="radio"]:checked ~ label {
    background: rgb(255, 126, 126);
  }
</style>