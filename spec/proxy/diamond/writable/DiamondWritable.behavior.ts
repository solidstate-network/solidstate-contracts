import { OwnableBehaviorArgs, describeBehaviorOfERC165Base } from '../../../';
import { deployMockContract } from '@ethereum-waffle/mock-contract';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { describeFilter } from '@solidstate/library';
import {
  IDiamondWritable,
  IDiamondReadable__factory,
} from '@solidstate/typechain-types';
import { expect } from 'chai';
import { ethers } from 'hardhat';

export interface DiamondWritableBehaviorArgs extends OwnableBehaviorArgs {}

export function describeBehaviorOfDiamondWritable(
  deploy: () => Promise<IDiamondWritable>,
  { getOwner, getNonOwner }: DiamondWritableBehaviorArgs,
  skips?: string[],
) {
  const describe = describeFilter(skips);

  describe('::DiamondWritable', function () {
    let owner: SignerWithAddress;
    let nonOwner: SignerWithAddress;

    const functions: string[] = [];
    const functionSelectors: string[] = [];
    let abi: any;
    let facet: any;

    let instance: IDiamondWritable;

    before(async function () {
      owner = await getOwner();
      nonOwner = await getNonOwner();

      for (let i = 0; i < 24; i++) {
        const fn = `fn${i}()`;
        functions.push(fn);
        functionSelectors.push(
          ethers.utils.hexDataSlice(
            ethers.utils.solidityKeccak256(['string'], [fn]),
            0,
            4,
          ),
        );
      }

      abi = functions.map((fn) => `function ${fn}`);

      facet = await deployMockContract(owner, abi);
    });

    beforeEach(async function () {
      instance = await deploy();
    });

    // TODO: nonstandard usage
    describeBehaviorOfERC165Base(
      deploy as any,
      {
        interfaceIds: ['0x1f931c1c'],
      },
      skips,
    );

    describe('#diamondCut((address,enum,bytes4[])[],address,bytes)', function () {
      it('emits DiamondCut event', async function () {
        const facets: any = [
          {
            facetAddress: facet.address,
            action: 0,
            functionSelectors: [
              ethers.utils.hexlify(ethers.utils.randomBytes(4)),
            ],
          },
        ];
        const target = ethers.constants.AddressZero;
        const data = '0x';

        let tx = instance.connect(owner).diamondCut(facets, target, data);

        const events = (await (await tx).wait()).events;
        const argsResult: any = events![0].args!;

        expect(argsResult.facetCuts[0].target).to.eq(facets[0].target);
        expect(argsResult.facetCuts[0].action).to.eq(facets[0].action);
        expect(argsResult.facetCuts[0].selectors).to.deep.eq(
          facets[0].selectors,
        );

        expect(argsResult.target).to.eq(target);
        expect(argsResult.data).to.eq(data);
      });

      describe('using FacetCutAction ADD', function () {
        it('adds facet', async function () {
          const contract = new ethers.Contract(
            instance.address,
            abi,
            ethers.provider,
          );

          for (let fn of functions) {
            await expect(
              contract.callStatic[fn](),
            ).to.be.revertedWithCustomError(
              instance,
              'Proxy__ImplementationIsNotContract',
            );
          }

          await instance
            .connect(owner)
            .diamondCut(
              [{ facetAddress: facet.address, action: 0, functionSelectors }],
              ethers.constants.AddressZero,
              '0x',
            );

          for (let fn of functions) {
            // call reverts, but with mock-specific message
            await expect(contract.callStatic[fn]()).to.be.revertedWith(
              'Mock on the method is not initialized',
            );
          }
        });

        describe('reverts if', function () {
          it('target facet is not a contract', async function () {
            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: ethers.constants.AddressZero,
                    action: 0,
                    functionSelectors: [ethers.utils.randomBytes(4)],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__TargetHasNoCode',
            );
          });

          it('selector has already been added', async function () {
            const facetCuts = [
              {
                facetAddress: facet.address,
                action: 0,
                functionSelectors: [ethers.utils.randomBytes(4)],
              },
            ];

            await instance
              .connect(owner)
              .diamondCut(facetCuts, ethers.constants.AddressZero, '0x');

            await expect(
              instance
                .connect(owner)
                .diamondCut(facetCuts, ethers.constants.AddressZero, '0x'),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__SelectorAlreadyAdded',
            );
          });
        });
      });

      describe('using FacetCutAction REPLACE', function () {
        it('replaces facet', async function () {
          const contract = new ethers.Contract(
            instance.address,
            abi,
            ethers.provider,
          );

          await instance
            .connect(owner)
            .diamondCut(
              [{ facetAddress: facet.address, action: 0, functionSelectors }],
              ethers.constants.AddressZero,
              '0x',
            );

          for (let fn of functions) {
            // call reverts, but with mock-specific message
            await expect(contract.callStatic[fn]()).to.be.revertedWith(
              'Mock on the method is not initialized',
            );
          }

          const facetReplacement = await deployMockContract(owner, abi);

          for (let fn of functions) {
            expect(facetReplacement[fn]).not.to.be.undefined;
          }

          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: facetReplacement.address,
                action: 1,
                functionSelectors,
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          for (let fn of functions) {
            // call reverts, but with mock-specific message
            await expect(contract.callStatic[fn]()).to.be.revertedWith(
              'Mock on the method is not initialized',
            );
          }
        });

        describe('reverts if', function () {
          it('target facet is not a contract', async function () {
            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: ethers.constants.AddressZero,
                    action: 1,
                    functionSelectors: [ethers.utils.randomBytes(4)],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__TargetHasNoCode',
            );
          });

          it('selector has not been added', async function () {
            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: facet.address,
                    action: 1,
                    functionSelectors: [ethers.utils.randomBytes(4)],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__SelectorNotFound',
            );
          });

          it('selector is immutable', async function () {
            const selector = ethers.utils.randomBytes(4);

            await instance.connect(owner).diamondCut(
              [
                {
                  facetAddress: instance.address,
                  action: 0,
                  functionSelectors: [selector],
                },
              ],
              ethers.constants.AddressZero,
              '0x',
            );

            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: facet.address,
                    action: 1,
                    functionSelectors: [selector],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__SelectorIsImmutable',
            );
          });

          it('replacement facet is same as existing facet', async function () {
            const selector = ethers.utils.randomBytes(4);

            await instance.connect(owner).diamondCut(
              [
                {
                  facetAddress: facet.address,
                  action: 0,
                  functionSelectors: [selector],
                },
              ],
              ethers.constants.AddressZero,
              '0x',
            );

            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: facet.address,
                    action: 1,
                    functionSelectors: [selector],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__ReplaceTargetIsIdentical',
            );
          });
        });
      });

      describe('using FacetCutAction REMOVE', function () {
        it('removes facet', async function () {
          const contract = new ethers.Contract(
            instance.address,
            abi,
            ethers.provider,
          );

          await instance
            .connect(owner)
            .diamondCut(
              [{ facetAddress: facet.address, action: 0, functionSelectors }],
              ethers.constants.AddressZero,
              '0x',
            );

          for (let fn of functions) {
            // call reverts, but with mock-specific message
            await expect(contract.callStatic[fn]()).to.be.revertedWith(
              'Mock on the method is not initialized',
            );
          }

          await instance.connect(owner).diamondCut(
            [
              {
                facetAddress: ethers.constants.AddressZero,
                action: 2,
                functionSelectors,
              },
            ],
            ethers.constants.AddressZero,
            '0x',
          );

          for (let fn of functions) {
            await expect(
              contract.callStatic[fn](),
            ).to.be.revertedWithCustomError(
              instance,
              'Proxy__ImplementationIsNotContract',
            );
          }
        });

        describe('reverts if', function () {
          it('target address is not zero address', async function () {
            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: instance.address,
                    action: 2,
                    functionSelectors: [ethers.utils.randomBytes(4)],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__RemoveTargetNotZeroAddress',
            );
          });

          it('selector has not been added', async function () {
            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: ethers.constants.AddressZero,
                    action: 2,
                    functionSelectors: [ethers.utils.randomBytes(4)],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__SelectorNotFound',
            );
          });

          it('selector is immutable', async function () {
            const selector = ethers.utils.randomBytes(4);

            await instance.connect(owner).diamondCut(
              [
                {
                  facetAddress: instance.address,
                  action: 0,
                  functionSelectors: [selector],
                },
              ],
              ethers.constants.AddressZero,
              '0x',
            );

            await expect(
              instance.connect(owner).diamondCut(
                [
                  {
                    facetAddress: ethers.constants.AddressZero,
                    action: 2,
                    functionSelectors: [selector],
                  },
                ],
                ethers.constants.AddressZero,
                '0x',
              ),
            ).to.be.revertedWithCustomError(
              instance,
              'DiamondWritable__SelectorIsImmutable',
            );
          });
        });
      });

      describe('reverts if', function () {
        it('sender is not owner', async function () {
          await expect(
            instance
              .connect(nonOwner)
              .diamondCut([], ethers.constants.AddressZero, '0x'),
          ).to.be.revertedWithCustomError(instance, 'Ownable__NotOwner');
        });

        it('passed FacetCutAction is invalid', async function () {
          await expect(
            instance.connect(owner).diamondCut(
              [
                {
                  facetAddress: ethers.constants.AddressZero,
                  action: 3,
                  functionSelectors: [],
                },
              ],
              ethers.constants.AddressZero,
              '0x',
            ),
          ).to.be.revertedWithoutReason();
        });

        it('passed selector array is empty', async function () {
          await expect(
            instance.connect(owner).diamondCut(
              [
                {
                  facetAddress: ethers.constants.AddressZero,
                  action: 0,
                  functionSelectors: [],
                },
              ],
              ethers.constants.AddressZero,
              '0x',
            ),
          ).to.be.revertedWithCustomError(
            instance,
            'DiamondWritable__SelectorNotSpecified',
          );
        });

        it('initialization target is provided but data is not', async function () {
          await expect(
            instance.connect(owner).diamondCut([], facet.address, '0x'),
          ).to.be.revertedWithCustomError(
            instance,
            'DiamondWritable__InvalidInitializationParameters',
          );
        });

        it('initialization data is provided but target is not', async function () {
          await expect(
            instance
              .connect(owner)
              .diamondCut([], ethers.constants.AddressZero, '0x01'),
          ).to.be.revertedWithCustomError(
            instance,
            'DiamondWritable__InvalidInitializationParameters',
          );
        });

        it('initialization target has no code', async function () {
          await expect(
            instance.connect(owner).diamondCut([], owner.address, '0x01'),
          ).to.be.revertedWithCustomError(
            instance,
            'DiamondWritable__TargetHasNoCode',
          );
        });

        it('initialization function reverts', async function () {
          await expect(
            instance.connect(owner).diamondCut([], facet.address, '0x01'),
          ).to.be.revertedWith('Mock on the method is not initialized');
        });
      });
    });
  });
}
