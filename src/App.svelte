<script lang="ts">
  import * as A from "fp-ts/lib/Array";
  import { pipe } from "fp-ts/lib/function";
  import * as O from "fp-ts/lib/Option";
  import {
    availableCompanyShifts as availableCompanyShiftsData,
    usershifts as userShiftsData,
  } from "./data";
  import { getShiftStrings, removeIndex, isShiftDisabled } from "./helpers";
  import Select from "./Select.svelte";
  import type { SelectOption } from "./Select.svelte";
  import type { IShift } from "./types";
  import UserShiftItem from "./UserShiftItem.svelte";

  let userShifts: Array<IShift> = [...userShiftsData];
  let availableCompanyShifts: Array<IShift> = [...availableCompanyShiftsData];
  let selectedIndex: O.Option<number> = O.none;

  $: userShiftStrings = getShiftStrings(userShifts);

  /** check if a shift conflicts with the user's, then we should disable*/
  $: isDisabled = (idx: number): boolean =>
    pipe(
      availableCompanyShifts,
      A.lookup(idx),
      O.map((acs) => isShiftDisabled({ userShifts, shift: acs })),
      O.getOrElse<boolean>(() => false)
    );

  /** make conflicting shift options disabled*/
  $: selectOptions = pipe(
    availableCompanyShifts,
    getShiftStrings,
    A.mapWithIndex<string, SelectOption>((i, s) => ({
      text: s,
      disabled: isDisabled(i),
    }))
  );

  /** disable add button for conflicting shifts*/
  $: disableAdd = pipe(
    selectedIndex,
    O.map(isDisabled),
    O.getOrElse(() => true)
  );

  $: selectedIndexNum = pipe(selectedIndex, O.toUndefined);

  const onRemoveUserShift = (idx: number) => {
    /** remove shift from user's shifts */
    userShifts = pipe(
      userShifts,
      removeIndex<IShift>(idx),
      O.getOrElse(() => userShifts)
    );
  };

  const onChangeSelect = (idx: number | undefined) => {
    selectedIndex = pipe(idx, O.fromNullable);
  };

  const onAddSelectedShift = () => {
    pipe(
      selectedIndex,
      O.chain((si) => pipe(availableCompanyShifts, A.lookup(si))),
      O.map((shift) => {
        /**
         * if the shift does not interfere with the users's shifts,
         * then add the shift to the user's shift
         */
        userShifts = [...userShifts, shift];

        /** reset selected index*/
        selectedIndex = O.none;
      }),
      O.getOrElse(() => {})
    );
  };
</script>

{@debug selectedIndex, disableAdd, availableCompanyShifts}

<main>
  <div class="shift-card">
    <div class="user-shift-items-box">
      {#if pipe(userShiftStrings, A.isEmpty)}
        <span class="empty-user-shifts">You have no shifts.</span>
      {:else}
        {#each userShiftStrings as us, idx}
          <UserShiftItem text={us} onRemove={() => onRemoveUserShift(idx)} />
        {/each}
      {/if}
    </div>

    <Select
      selectedIndex={selectedIndexNum}
      options={selectOptions}
      onAddSelected={onAddSelectedShift}
      label="Available Company Shifts"
      {onChangeSelect}
      {disableAdd}
    />
  </div>
</main>

<style>
  main {
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .shift-card {
    width: 268px;
    display: flex;
    flex-flow: column;
    justify-content: center;
    border-radius: 16px;
    border: 1px solid lightgray;
    padding: 24px;
  }

  .user-shift-items-box {
    min-height: 40px;
    text-align: center;
    margin-bottom: 16px;
  }

  .empty-user-shifts {
    font-size: 0.7rem;
    color: #fe845f;
  }
</style>
