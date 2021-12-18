<script>
  import { fade, scale } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let details = [];


  const dispatch = createEventDispatcher();

  const handleclose = (taskId) => {
    dispatch("close-task", taskId);
  };
</script>

<div class="box shade_{details.priority}" in:scale out:fade={{ duration: 500 }}>
  <div class="head">{details.task}</div>
  <div class="sub">{details.date}</div>
  <button on:click={() => handleclose(details.id)}>x</button>
</div>

<style>
  .box {
    padding: 10px;
    position: relative;
    margin: 10px 0;
    border-radius: 3px;
    box-shadow:rgb(255 0 0 / 20%) 0px 1px 3px 0px, rgb(255 0 123 / 17%) 0px 1px 2px 0px;
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
    color: #5e5c5c;
    font-weight: 600;
  }
  .box button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    outline: none;
    background: none;
    color: rgb(255 104 104);
    font-weight: 700;
    font-size: 17px;
    background: rgb(255 212 212);
    border-radius: 50%;
  }
  .box button:hover {
    color: rgb(255, 97, 97);
  }
  .shade_1{
    background: hsl(0deg 100% 95%);
  }
  .shade_2{
    background: hsl(0deg 100% 90%);
  }
  .shade_3{
    background: hsl(0deg 100% 85%);
  }
  .shade_4{
    background: hsl(0deg 100% 80%);
  }
  .shade_5{
    background: hsl(0deg 100% 75%);
  }
</style>