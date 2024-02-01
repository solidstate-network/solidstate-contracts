import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { bigintToBytes16 } from '@solidstate/library';
import {
  PackedDoublyLinkedListBytes16Mock,
  PackedDoublyLinkedListBytes16Mock__factory,
  PackedDoublyLinkedListUint128Mock,
  PackedDoublyLinkedListUint128Mock__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('PackedDoublyLinkedList', async () => {
  describe('Bytes16List', async () => {
    let instance: PackedDoublyLinkedListBytes16Mock;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      instance = await new PackedDoublyLinkedListBytes16Mock__factory(
        deployer,
      ).deploy();
    });

    describe('__internal', () => {
      const zeroBytes16 = bigintToBytes16(0);
      const oneBytes16 = bigintToBytes16(1);
      const twoBytes16 = bigintToBytes16(2);
      const threeBytes16 = bigintToBytes16(3);

      describe('#contains(bytes16)', () => {
        it('returns true if the value has been added', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.contains.staticCall(oneBytes16)).to.be.true;
          expect(await instance.contains.staticCall(twoBytes16)).to.be.true;
        });

        it('returns false if the value has not been added', async () => {
          expect(await instance.contains.staticCall(oneBytes16)).to.be.false;
          await instance.push(oneBytes16);
          expect(await instance.contains.staticCall(twoBytes16)).to.be.false;
        });

        it('returns false for zero value', async () => {
          expect(await instance.contains.staticCall(zeroBytes16)).to.be.false;
        });
      });

      describe('#prev(bytes16)', () => {
        it('returns the previous value in the list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.prev.staticCall(twoBytes16)).to.eq(oneBytes16);
        });

        it('returns zero if the value is at the beginning of the list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.prev.staticCall(oneBytes16)).to.eq(zeroBytes16);
        });

        it('returns last value in list if input is zero', async () => {
          expect(await instance.next.staticCall(zeroBytes16)).to.eq(
            zeroBytes16,
          );

          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.prev.staticCall(zeroBytes16)).to.eq(twoBytes16);
        });

        describe('reverts if', () => {
          it('value is not contained in list', async () => {
            await expect(
              instance.prev.staticCall(oneBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#next(bytes16)', () => {
        it('returns the next value in the list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(twoBytes16);
        });

        it('returns zero if the value is at the end of the list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(zeroBytes16);
        });

        it('returns first value in list if input is zero', async () => {
          expect(await instance.next.staticCall(zeroBytes16)).to.eq(
            zeroBytes16,
          );

          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.next.staticCall(zeroBytes16)).to.eq(oneBytes16);
        });

        describe('reverts if', () => {
          it('value is not contained in list', async () => {
            await expect(
              instance.next.staticCall(oneBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#insertBefore(bytes16,bytes16)', () => {
        it('returns true if value is added to list', async () => {
          expect(
            await instance.insertBefore.staticCall(zeroBytes16, oneBytes16),
          ).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneBytes16);

          expect(
            await instance.insertBefore.staticCall(zeroBytes16, oneBytes16),
          ).to.be.false;
        });

        it('adds new value to list in position before existing value', async () => {
          await instance.insertBefore(zeroBytes16, oneBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(zeroBytes16);

          await instance.insertBefore(oneBytes16, twoBytes16);

          expect(await instance.next.staticCall(twoBytes16)).to.eq(oneBytes16);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.insertBefore(zeroBytes16, zeroBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('value is not contained in list', async () => {
            await expect(
              instance.insertBefore(oneBytes16, twoBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#insertAfter(bytes16,bytes16)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.insertAfter.staticCall(zeroBytes16, oneBytes16))
            .to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.insertAfter.staticCall(zeroBytes16, oneBytes16))
            .to.be.false;
        });

        it('adds new value to list in position before existing value', async () => {
          await instance.insertAfter(zeroBytes16, oneBytes16);

          expect(await instance.prev.staticCall(oneBytes16)).to.eq(zeroBytes16);

          await instance.insertAfter(oneBytes16, twoBytes16);

          expect(await instance.prev.staticCall(twoBytes16)).to.eq(oneBytes16);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.insertAfter(zeroBytes16, zeroBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('value is not contained in list', async () => {
            await expect(
              instance.insertAfter(oneBytes16, twoBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#push(bytes16)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.push.staticCall(oneBytes16)).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.push.staticCall(oneBytes16)).to.be.false;
        });

        it('adds new value to end of list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(zeroBytes16);

          await instance.push(twoBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(twoBytes16);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.push(zeroBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });
        });
      });

      describe('#pop()', () => {
        it('returns last value in list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.pop.staticCall()).to.eq(twoBytes16);
        });

        it('returns zero if list is empty', async () => {
          expect(await instance.pop.staticCall()).to.eq(zeroBytes16);
        });

        it('removes last value from list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          await instance.pop();

          expect(await instance.contains.staticCall(twoBytes16)).to.be.false;

          expect(await instance.prev.staticCall(zeroBytes16)).to.eq(oneBytes16);

          expect(await instance.next.staticCall(oneBytes16)).to.eq(zeroBytes16);
        });
      });

      describe('#shift()', () => {
        it('returns first value in list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.shift.staticCall()).to.eq(oneBytes16);
        });

        it('returns zero if list is empty', async () => {
          expect(await instance.shift.staticCall()).to.eq(zeroBytes16);
        });

        it('removes first value from list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          await instance.shift();

          expect(await instance.contains.staticCall(oneBytes16)).to.be.false;

          expect(await instance.next.staticCall(zeroBytes16)).to.eq(twoBytes16);

          expect(await instance.prev.staticCall(twoBytes16)).to.eq(zeroBytes16);
        });
      });

      describe('#unshift(bytes16)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.unshift.staticCall(oneBytes16)).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.unshift(oneBytes16);

          expect(await instance.unshift.staticCall(oneBytes16)).to.be.false;
        });

        it('adds new value to beginning of list', async () => {
          await instance.unshift(oneBytes16);

          expect(await instance.prev.staticCall(oneBytes16)).to.eq(zeroBytes16);

          await instance.unshift(twoBytes16);

          expect(await instance.prev.staticCall(oneBytes16)).to.eq(twoBytes16);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.unshift(zeroBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });
        });
      });

      describe('#remove(bytes16)', () => {
        it('returns true if value is removed from list', async () => {
          await instance.push(oneBytes16);

          expect(await instance.remove.staticCall(oneBytes16)).to.be.true;
        });

        it('returns false if value is not removed from list', async () => {
          expect(await instance.remove.staticCall(oneBytes16)).to.be.false;
        });

        it('removes value from list', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);
          await instance.push(threeBytes16);

          await instance.remove(twoBytes16);

          expect(await instance.contains.staticCall(twoBytes16)).to.be.false;

          expect(await instance.next.staticCall(oneBytes16)).to.eq(
            threeBytes16,
          );

          expect(await instance.prev.staticCall(threeBytes16)).to.eq(
            oneBytes16,
          );
        });
      });

      describe('#replace(bytes16,bytes16)', () => {
        it('returns true if value is replaced', async () => {
          await instance.push(oneBytes16);

          expect(await instance.replace.staticCall(oneBytes16, twoBytes16)).to
            .be.true;
        });

        it('returns false if value is not replaced', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          expect(await instance.replace.staticCall(oneBytes16, twoBytes16)).to
            .be.false;
        });

        it('replaces existing value with new value', async () => {
          const newValue = bigintToBytes16(4);

          await instance.push(oneBytes16);
          await instance.push(twoBytes16);
          await instance.push(threeBytes16);

          expect(await instance.contains.staticCall(newValue)).to.be.false;

          await instance.replace(twoBytes16, newValue);

          expect(await instance.contains.staticCall(twoBytes16)).to.be.false;
          expect(await instance.contains.staticCall(newValue)).to.be.true;

          expect(await instance.next.staticCall(oneBytes16)).to.eq(newValue);
          expect(await instance.prev.staticCall(newValue)).to.eq(oneBytes16);
          expect(await instance.next.staticCall(newValue)).to.eq(threeBytes16);
          expect(await instance.prev.staticCall(threeBytes16)).to.eq(newValue);
        });

        it('does nothing if new value matches existing value', async () => {
          await instance.push(oneBytes16);
          await instance.push(twoBytes16);

          await instance.replace(oneBytes16, oneBytes16);

          expect(await instance.contains.staticCall(oneBytes16)).to.be.true;

          expect(await instance.next.staticCall(zeroBytes16)).to.eq(oneBytes16);
          expect(await instance.prev.staticCall(oneBytes16)).to.eq(zeroBytes16);
          expect(await instance.next.staticCall(oneBytes16)).to.eq(twoBytes16);
          expect(await instance.prev.staticCall(twoBytes16)).to.eq(oneBytes16);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await instance.push(oneBytes16);

            await expect(
              instance.replace(oneBytes16, zeroBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('old value is not contained in list', async () => {
            await expect(
              instance.replace.staticCall(oneBytes16, twoBytes16),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });
    });
  });

  describe('Uint128List', async () => {
    let instance: PackedDoublyLinkedListUint128Mock;
    let deployer: SignerWithAddress;

    beforeEach(async () => {
      [deployer] = await ethers.getSigners();
      instance = await new PackedDoublyLinkedListUint128Mock__factory(
        deployer,
      ).deploy();
    });

    describe('__internal', () => {
      const zeroUint128 = 0;
      const oneUint128 = 1;
      const twoUint128 = 2;
      const threeUint128 = 3;

      describe('#contains(uint128)', () => {
        it('returns true if the value has been added', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.contains.staticCall(oneUint128)).to.be.true;
          expect(await instance.contains.staticCall(twoUint128)).to.be.true;
        });

        it('returns false if the value has not been added', async () => {
          expect(await instance.contains.staticCall(oneUint128)).to.be.false;
          await instance.push(oneUint128);
          expect(await instance.contains.staticCall(twoUint128)).to.be.false;
        });

        it('returns false for zero value', async () => {
          expect(await instance.contains.staticCall(zeroUint128)).to.be.false;
        });
      });

      describe('#prev(uint128)', () => {
        it('returns the previous value in the list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.prev.staticCall(twoUint128)).to.eq(oneUint128);
        });

        it('returns zero if the value is at the beginning of the list', async () => {
          await instance.push(oneUint128);

          expect(await instance.prev.staticCall(oneUint128)).to.eq(zeroUint128);
        });

        it('returns last value in list if input is zero', async () => {
          expect(await instance.next.staticCall(zeroUint128)).to.eq(
            zeroUint128,
          );

          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.prev.staticCall(zeroUint128)).to.eq(twoUint128);
        });

        describe('reverts if', () => {
          it('value is not contained in list', async () => {
            await expect(
              instance.prev.staticCall(oneUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#next(uint128)', () => {
        it('returns the next value in the list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(twoUint128);
        });

        it('returns zero if the value is at the end of the list', async () => {
          await instance.push(oneUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(zeroUint128);
        });

        it('returns first value in list if input is zero', async () => {
          expect(await instance.next.staticCall(zeroUint128)).to.eq(
            zeroUint128,
          );

          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.next.staticCall(zeroUint128)).to.eq(oneUint128);
        });

        describe('reverts if', () => {
          it('value is not contained in list', async () => {
            await expect(
              instance.next.staticCall(oneUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#insertBefore(uint128,uint128)', () => {
        it('returns true if value is added to list', async () => {
          expect(
            await instance.insertBefore.staticCall(zeroUint128, oneUint128),
          ).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneUint128);

          expect(
            await instance.insertBefore.staticCall(zeroUint128, oneUint128),
          ).to.be.false;
        });

        it('adds new value to list in position before existing value', async () => {
          await instance.insertBefore(zeroUint128, oneUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(zeroUint128);

          await instance.insertBefore(oneUint128, twoUint128);

          expect(await instance.next.staticCall(twoUint128)).to.eq(oneUint128);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.insertBefore(zeroUint128, zeroUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('value is not contained in list', async () => {
            await expect(
              instance.insertBefore(oneUint128, twoUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#insertAfter(uint128,uint128)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.insertAfter.staticCall(zeroUint128, oneUint128))
            .to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneUint128);

          expect(await instance.insertAfter.staticCall(zeroUint128, oneUint128))
            .to.be.false;
        });

        it('adds new value to list in position before existing value', async () => {
          await instance.insertAfter(zeroUint128, oneUint128);

          expect(await instance.prev.staticCall(oneUint128)).to.eq(zeroUint128);

          await instance.insertAfter(oneUint128, twoUint128);

          expect(await instance.prev.staticCall(twoUint128)).to.eq(oneUint128);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.insertAfter(zeroUint128, zeroUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('value is not contained in list', async () => {
            await expect(
              instance.insertAfter(oneUint128, twoUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });

      describe('#push(uint128)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.push.staticCall(oneUint128)).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.push(oneUint128);

          expect(await instance.push.staticCall(oneUint128)).to.be.false;
        });

        it('adds new value to end of list', async () => {
          await instance.push(oneUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(zeroUint128);

          await instance.push(twoUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(twoUint128);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.push(zeroUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });
        });
      });

      describe('#pop()', () => {
        it('returns last value in list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.pop.staticCall()).to.eq(twoUint128);
        });

        it('returns zero if list is empty', async () => {
          expect(await instance.pop.staticCall()).to.eq(zeroUint128);
        });

        it('removes last value from list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          await instance.pop();

          expect(await instance.contains.staticCall(twoUint128)).to.be.false;

          expect(await instance.prev.staticCall(zeroUint128)).to.eq(oneUint128);

          expect(await instance.next.staticCall(oneUint128)).to.eq(zeroUint128);
        });
      });

      describe('#shift()', () => {
        it('returns first value in list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.shift.staticCall()).to.eq(oneUint128);
        });

        it('returns zero if list is empty', async () => {
          expect(await instance.shift.staticCall()).to.eq(zeroUint128);
        });

        it('removes first value from list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          await instance.shift();

          expect(await instance.contains.staticCall(oneUint128)).to.be.false;

          expect(await instance.next.staticCall(zeroUint128)).to.eq(twoUint128);

          expect(await instance.prev.staticCall(twoUint128)).to.eq(zeroUint128);
        });
      });

      describe('#unshift(uint128)', () => {
        it('returns true if value is added to list', async () => {
          expect(await instance.unshift.staticCall(oneUint128)).to.be.true;
        });

        it('returns false if value is not added to list', async () => {
          await instance.unshift(oneUint128);

          expect(await instance.unshift.staticCall(oneUint128)).to.be.false;
        });

        it('adds new value to beginning of list', async () => {
          await instance.unshift(oneUint128);

          expect(await instance.prev.staticCall(oneUint128)).to.eq(zeroUint128);

          await instance.unshift(twoUint128);

          expect(await instance.prev.staticCall(oneUint128)).to.eq(twoUint128);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await expect(
              instance.unshift(zeroUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });
        });
      });

      describe('#remove(uint128)', () => {
        it('returns true if value is removed from list', async () => {
          await instance.push(oneUint128);

          expect(await instance.remove.staticCall(oneUint128)).to.be.true;
        });

        it('returns false if value is not removed from list', async () => {
          expect(await instance.remove.staticCall(oneUint128)).to.be.false;
        });

        it('removes value from list', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);
          await instance.push(threeUint128);

          await instance.remove(twoUint128);

          expect(await instance.contains.staticCall(twoUint128)).to.be.false;

          expect(await instance.next.staticCall(oneUint128)).to.eq(
            threeUint128,
          );

          expect(await instance.prev.staticCall(threeUint128)).to.eq(
            oneUint128,
          );
        });
      });

      describe('#replace(uint128,uint128)', () => {
        it('returns true if value is replaced', async () => {
          await instance.push(oneUint128);

          expect(await instance.replace.staticCall(oneUint128, twoUint128)).to
            .be.true;
        });

        it('returns false if value is not replaced', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          expect(await instance.replace.staticCall(oneUint128, twoUint128)).to
            .be.false;
        });

        it('replaces existing value with new value', async () => {
          const newValue = 4;

          await instance.push(oneUint128);
          await instance.push(twoUint128);
          await instance.push(threeUint128);

          expect(await instance.contains.staticCall(newValue)).to.be.false;

          await instance.replace(twoUint128, newValue);

          expect(await instance.contains.staticCall(twoUint128)).to.be.false;
          expect(await instance.contains.staticCall(newValue)).to.be.true;

          expect(await instance.next.staticCall(oneUint128)).to.eq(newValue);
          expect(await instance.prev.staticCall(newValue)).to.eq(oneUint128);
          expect(await instance.next.staticCall(newValue)).to.eq(threeUint128);
          expect(await instance.prev.staticCall(threeUint128)).to.eq(newValue);
        });

        it('does nothing if new value matches existing value', async () => {
          await instance.push(oneUint128);
          await instance.push(twoUint128);

          await instance.replace(oneUint128, oneUint128);

          expect(await instance.contains.staticCall(oneUint128)).to.be.true;

          expect(await instance.next.staticCall(zeroUint128)).to.eq(oneUint128);
          expect(await instance.prev.staticCall(oneUint128)).to.eq(zeroUint128);
          expect(await instance.next.staticCall(oneUint128)).to.eq(twoUint128);
          expect(await instance.prev.staticCall(twoUint128)).to.eq(oneUint128);
        });

        describe('reverts if', () => {
          it('new value is zero', async () => {
            await instance.push(oneUint128);

            await expect(
              instance.replace(oneUint128, zeroUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__InvalidInput',
            );
          });

          it('old value is not contained in list', async () => {
            await expect(
              instance.replace.staticCall(oneUint128, twoUint128),
            ).to.be.revertedWithCustomError(
              instance,
              'DoublyLinkedList__NonExistentEntry',
            );
          });
        });
      });
    });
  });
});
