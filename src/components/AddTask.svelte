<script>
  import { v4 as uuid } from "uuid";
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import Priority from "./Priority.svelte";

  let taskdetaile = "";
  let taskdate = false;
  let btnDisable = true;
  let min = 10;
  let message;
  let priorityNo = 1;

  const dispatch = createEventDispatcher();

  const handleChange = (e) => {
    if (taskdetaile.trim().length <= min) {
      message = "task length should be higher than 10 character";
      btnDisable = true;
    } else {
      btnDisable = false;
      message = false;
    }
  };
  const handleSubmit = () => {
    if (taskdetaile.trim().length <= min) {
      message = "task length should be higher than 10 character";
      btnDisable = true;
    }
    if (!taskdate) {
      message = "select task date";
      btnDisable = false;
      return;
    }
    if (taskdetaile.trim().length > min) {
      btnDisable = true;
      message = false;
      let datas = {
        id: uuid(),
        task: taskdetaile,
        date: taskdate,
        priority: priorityNo,
      };
      dispatch("new-task", datas);
      taskdate = "";
      taskdetaile = "";
      priorityNo = 1;
    }
  };
  const prioritySelect = (e) => {
    priorityNo = e.detail;
  };
</script>

<form on:submit|preventDefault={handleSubmit}>
  <label for="task-data" class="t-head">Task Details</label>
  <input type="text" id="task-data" class="text-box" bind:value={taskdetaile} on:input={handleChange} />
  <label for="task-date" class="t-head">Task Date</label>
  <input type="date" id="task-date" class="text-box" bind:value={taskdate} />
  <Priority on:priority-no={prioritySelect} />
  <Button disabled={btnDisable} type="submit">ADD</Button>
</form>
{#if message}
  <div class="alert">{message}</div>
{/if}

<style>
  .alert {
    margin: 10px auto;
    display: flex;
    font-size: 15px;
    max-width: 300px;
    color: #ff728d;
    text-transform: capitalize;
    font-weight: 500;
  }
  .text-box {
    display: block;
    border: 0.4px solid silver;
    border-radius: 3px;
    width: 300px;
    padding: 8px;
    margin: 10px auto;
    font-weight: 500;
    color: #1b1b1b;
    font-size: 15px;
    outline: none;
    font-family: inherit;
  }
  .text-box:focus {
    border: 0.4px solid rgb(0, 195, 255);
  }
</style>