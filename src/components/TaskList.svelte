<script>
  import { fade, scale } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let details = [];

  const dispatch = createEventDispatcher();

  const handleclose = (taskId) => {
    dispatch("close-task", taskId);
  };
</script>

<div class="box" in:scale out:fade={{ duration: 500 }}>
  <div class="head">{details.task}</div>
  <div class="sub">{details.date}</div>
  <div class="sub">{details.priority}</div>
  <button on:click={() => handleclose(details.id)}>x</button>
</div>

<style>
  .box {
    padding: 10px;
    position: relative;
    margin: 10px 0;
    border-radius: 3px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }
  .box div {
    word-break: break-all;
    word-break: break-word;
    margin: 5px;
    margin-right: 25px;
    font-size: 15px;
    font-weight: 500;
  }
  .box .head {
    font-weight: 600;
    color: #1b1b1b;
  }
  .box .sub {
    margin: 5px;
    color: #666666;
  }
  .box button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    outline: none;
    background: none;
    color: rgb(255 140 140);
    font-weight: 700;
    font-size: 17px;
    background: rgb(255 192 192);
    border-radius: 50%;
  }
  .box button:hover {
    color: rgb(255, 97, 97);
  }
</style>