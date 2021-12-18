<script>
  export let count = "";
</script>

<div class="count-container">
  <div class="count-bar">{count}</div>
  Tasks
</div>

<style>
  .count-container {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #666666;
    font-weight: 600;
    height: 50px;
  }
  .count-bar {
    margin-right: 10px;
    font-weight: 800;
    border-radius: 50%;
    background: #ffa0a0;
    color: #5e5a5a;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>