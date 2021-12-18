<script>
  import TaskList from "./TaskList.svelte";
  import AddTask from "./AddTask.svelte";
  import TaskCounts from "./TaskCounts.svelte";
  let Items = [
    {
      id: 1,
      task: "buy grocery on friday",
      date: "12/12/2021",
      priority: 3,
    },
    {
      id: 2,
      task: "party on saturday",
      date: "13/12/2021",
      priority: 2,
    },
    {
      id: 3,
      task: "lundary on sunday",
      date: "14/12/2021",
      priority: 1,
    }
  ];
  const handleclose = (e) => {
    let taskId = e.detail;
    Items = Items.filter((Item) => Item.id != taskId);
  };
  const handleNew = (e) => {
    let newTask = e.detail;
    Items = [newTask, ...Items];
  };
  $: taskcount = Items.length;
</script>

<svelte:head>
  <title>Tasks</title>
</svelte:head>

<div class="container">
  <AddTask on:new-task={handleNew} />
  <TaskCounts count={taskcount} />
  {#each Items as item (item.id)}
    <TaskList details={item} on:close-task={handleclose} />
  {/each}
</div>

<style>
  .container {
    max-width: 500px;
    margin: 20px auto;
    margin-bottom: 50px;
  }
</style>