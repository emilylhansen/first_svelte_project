<script context="module" lang="ts">
  export type SelectOption = { text: string; disabled: boolean };
</script>

<script lang="ts">
  /** TODO: convert to Option. idk why i can't get it to work... */
  export let selectedIndex: number | undefined;
  export let options: Array<SelectOption>;
  export let onAddSelected: () => void;
  export let onChangeSelect: (idx: number | undefined) => void;
  export let label: string;
  export let disableAdd: boolean;

  /** on:blur does not work the same as on:change*/
</script>

<div class="select-box">
  <label for="select">{label}</label>
  <div class="flex">
    <select
      name="select"
      bind:value={selectedIndex}
      on:change={() => onChangeSelect(selectedIndex)}
    >
      <option disabled selected={selectedIndex === undefined} value>
        select an option
      </option>
      {#each options as o, idx}
        <option value={idx} disabled={o.disabled}>{o.text}</option>
      {/each}
    </select>
    <button class="add-button" on:click={onAddSelected} disabled={disableAdd}
      >ADD</button
    >
  </div>
</div>

<!-- {@debug selectedIndex, v, isDefaultSelected} -->
<style>
  .select-box {
    display: flex;
    flex-flow: column;
  }

  .flex {
    display: flex;
  }

  label {
    text-align: start;
    font-size: 0.7rem;
    margin-bottom: 4px;
  }

  select {
    flex: 1;
    margin: 0 8px 0 0;
  }

  .add-button {
    margin: 0;
    border: 1px solid #fe845f;
    color: #fe845f;
    background-color: #fff;
  }
</style>
