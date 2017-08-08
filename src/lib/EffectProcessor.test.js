jest.mock('./GLRenderer');

import EffectProcessor from './EffectProcessor';

describe('EffectProcessor', () => {
  const fakeState = {};

  describe('invalidatePassesFromPos', () => {
    test('should invalidate passes from position', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: fakeState },
      ];
      processor.invalidatePassesFromPos(2);
      expect(processor.passes).toEqual([
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: null },
        { prevState: null },
        { prevState: null },
      ]);
    });

    test('should correctly invalidate passes from zero', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: fakeState },
        { prevState: fakeState },
      ];
      processor.invalidatePassesFromPos(0);
      expect(processor.passes).toEqual([
        { prevState: null },
        { prevState: null },
        { prevState: null },
        { prevState: null },
      ]);
    });
  });

  describe('movePass', () => {
    test('should correctly move pass', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { name: 1, prevState: fakeState },
        { name: 2, prevState: fakeState },
        { name: 3, prevState: fakeState },
        { name: 4, prevState: fakeState },
      ];
      processor.movePass(0, 2);
      expect(processor.passes).toEqual([
        { name: 3, prevState: null },
        { name: 2, prevState: null },
        { name: 1, prevState: null },
        { name: 4, prevState: null },
      ]);
    });

    test('should not invalidate untouched elements', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { name: 1, prevState: fakeState },
        { name: 2, prevState: fakeState },
        { name: 3, prevState: fakeState },
        { name: 4, prevState: fakeState },
      ];
      processor.movePass(2, 3);
      expect(processor.passes).toEqual([
        { name: 1, prevState: fakeState },
        { name: 2, prevState: fakeState },
        { name: 4, prevState: null },
        { name: 3, prevState: null },
      ]);
    });
  });

  describe('removePassAt', () => {
    test('should correctly remove pass', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { name: 1, prevState: fakeState },
        { name: 2, prevState: fakeState },
        { name: 3, prevState: fakeState },
        { name: 4, prevState: fakeState },
      ];
      processor.removePassAt(1);
      expect(processor.passes).toEqual([
        { name: 1, prevState: fakeState },
        { name: 3, prevState: null },
        { name: 4, prevState: null },
      ]);
    });
  });

  describe('addPass', () => {
    test('should correctly invalidate passes', () => {
      const processor = new EffectProcessor();
      processor.passes = [
        { name: 1, prevState: fakeState },
        { name: 2, prevState: fakeState },
      ];
      processor.addPass({ shader: 't3h shad0r', name: 3 });
      expect(processor.passes[0].prevState).toEqual(fakeState);
      expect(processor.passes[1].prevState).toEqual(fakeState);
    });

    test('should fail if shader is not provided', () => {
      const processor = new EffectProcessor();
      try {
        processor.addPass({});
      } catch (e) {
        expect(e.message).toEqual('Can\'t use an effect without shader');
      }
    });
  });
});
