import { useCallback, useEffect } from 'react'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { isGreaterThan, isZero, NetworkPluginID } from '@masknet/web3-shared-base'
import { TransactionStateType, GasConfig, TransactionEventType, isValidAddress } from '@masknet/web3-shared-evm'
import { useERC20TokenContract } from './useERC20TokenContract'
import { useTransactionState } from './useTransactionState'
import { useAccount } from '../useAccount'
import { useChainId } from '../useChainId'

export function useERC20TokenTransferCallback(address?: string, amount?: string, recipient?: string) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc20Contract = useERC20TokenContract(chainId, address)
    const [transferState, setTransferState] = useTransactionState()

    const transferCallback = useCallback(
        async (amount?: string, recipient?: string, gasConfig?: GasConfig) => {
            if (!account || !recipient || !amount || isZero(amount) || !erc20Contract) {
                setTransferState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: invalid recipient address
            if (!isValidAddress(recipient)) {
                setTransferState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Invalid recipient address'),
                })
                return
            }

            // error: insufficient balance
            const balance = await erc20Contract.methods.balanceOf(account).call()

            if (isGreaterThan(amount, balance)) {
                setTransferState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Insufficient balance'),
                })
                return
            }

            // start waiting for provider to confirm tx
            setTransferState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await erc20Contract.methods
                    .transfer(recipient, amount)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
                ...gasConfig,
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                erc20Contract.methods
                    .transfer(recipient, amount)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                        setTransferState({
                            type: TransactionStateType.CONFIRMED,
                            no,
                            receipt,
                        })
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        setTransferState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    })
            })
        },
        [account, address, amount, recipient, erc20Contract],
    )

    const resetCallback = useCallback(() => {
        setTransferState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    useEffect(() => {
        if (transferState.type !== TransactionStateType.CONFIRMED) return
        resetCallback()
    }, [transferState.type])

    return [transferState, transferCallback, resetCallback] as const
}