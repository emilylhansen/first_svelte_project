import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import type { IShift } from "./types";

/** convert string to integer */
export const stringToInteger = (str: string): O.Option<number> => {
  const num = Number(str);

  return isNaN(num) ? O.none : O.some(num);
};

/** check if the range (i.e. start, end) falls within a shift */
export const doShiftsConflict = ({
  shiftA,
  shiftB,
}: {
  shiftA: IShift;
  shiftB: IShift;
}): boolean => {
  /** shift A integers */
  const shiftAStartO = stringToInteger(shiftA.start);
  const shiftAEndO = stringToInteger(shiftA.end);

  /** shift B integers */
  const shiftBStartO = stringToInteger(shiftB.start);
  const shiftBEndO = stringToInteger(shiftB.end);

  return pipe(
    sequenceS(O.option)({
      shiftAStartO,
      shiftAEndO,
      shiftBStartO,
      shiftBEndO,
    }),
    O.map((data) => {
      /**
       * sort the shift ranges and take the first two items.
       */
      const left2 = pipe(
        data,
        Object.values,
        A.sort(Ord.ordNumber),
        A.takeLeft(2)
      );

      /**
       * there is no conflict if the shift intervals are paired at the beginning and end.
       *
       * no conflict:
       * [startA, endA, startB, endB]
       *
       * conflict:
       * [startA, startB, endA, endB]
       */
      const isNotShift = pipe(
        sequenceS(O.option)({
          shift1Start: pipe(left2, A.head),
          shift1End: pipe(left2, A.last),
        }),
        O.map((d) => {
          const isShiftA =
            d.shift1Start === data.shiftAStartO &&
            d.shift1End === data.shiftAEndO;
          const isShiftB =
            d.shift1Start === data.shiftBStartO &&
            d.shift1End === data.shiftBEndO;

          return !(isShiftA || isShiftB);
        }),
        O.getOrElse<boolean>(() => false)
      );

      return isNotShift;
    }),
    O.getOrElse<boolean>(() => false)
  );
};

/**
 * check if a shift does not interfere with the user's shifts.
 */
export const isShiftDisabled = ({
  userShifts,
  shift,
}: {
  userShifts: Array<IShift>;
  shift: IShift;
}): boolean => {
  const hasConflict = pipe(
    userShifts,
    A.findFirst((us) =>
      doShiftsConflict({
        shiftA: us,
        shiftB: shift,
      })
    ),
    O.isSome
  );
  return hasConflict;
};

/** add preceeding zeros to a number string */
const preserveZeros = ({
  num,
  finalLength,
}: {
  num: number;
  finalLength: number;
}): string =>
  pipe(num, String, (numStr) =>
    pipe(
      A.range(1, finalLength - numStr.length),
      A.map((_) => 0),
      (zeroA) => zeroA.join(""),
      (zs) => zs + numStr
    )
  );

/** parse shift into readable string */
export const parseShift = (shift: IShift): O.Option<string> =>
  pipe(
    sequenceS(O.option)({
      start: stringToInteger(shift.start),
      end: stringToInteger(shift.end),
    }),
    O.map((data) => {
      const start = preserveZeros({
        num: data.start,
        finalLength: 4,
      });
      const end = preserveZeros({
        num: data.end,
        finalLength: 4,
      });

      return `${start} - ${end}`;
    })
  );

/** get readable shift strings */
export const getShiftStrings = (shifts: Array<IShift>): Array<string> =>
  pipe(
    shifts,
    A.filterMap((s) => parseShift(s))
  );

/** remove item from list at index */
export const removeIndex = <T extends unknown>(idx: number) => (
  arr: Array<T>
): O.Option<Array<T>> => {
  const _arr = [...arr];

  const deletedElems = _arr.splice(idx, 1);

  return A.isEmpty(deletedElems) ? O.none : O.some(_arr);
};
