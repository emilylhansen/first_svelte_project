<script lang="ts">
  export let text: string;
  export let onRemove: () => void;

  /**
   * I know my makeshift "icon buttons" are ugly,
   * but i didn't want to go svg hunting and all the
   * svelte design systems are terrible :)
   */
</script>

<div class="user-shift-item">
  <div class="user-shift">
    {text}
  </div>
  <button class="remove-button" on:click={onRemove}>
    <div class="remove-text">x</div>
  </button>
</div>

<style>
  .user-shift-item {
    border: 1px solid lightgray;
    border-radius: 3px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    justify-content: space-between;
    padding: 8px;
    font-size: 0.8rem;
  }

  .remove-button {
    margin: 0;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3728b1;
    color: #fe845f;
  }

  .remove-text {
    position: relative;
    top: -2px;
  }
</style>
