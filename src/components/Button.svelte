<script>
  export let style = "primary";
  export let disabled = disable;
  export let type = "submit";
</script>

<button {disabled} {type} class={style}>
  <slot />
</button>

<style>
  .primary {
    border: none;
    padding: 8px 10px;
    border-radius: 2px;
    color: #fff;
    font-weight: 700;
    margin: 25px auto;
    display: flex;
    font-size: 14px;
    max-width: 300px;
    background-color: #ec4d72;
  }
  .primary:disabled {
    opacity: 0.6;
  }
</style>