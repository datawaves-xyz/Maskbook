import { ProviderType } from '@masknet/web3-shared-evm'
import { CustomNetworkProvider } from './providers/CustomNetwork'
import { MaskWalletProvider } from './providers/MaskWallet'
import { MetaMaskProvider } from './providers/MetaMask'
import WalletConnectProvider from './providers/WalletConnect'
import type { BaseProvider } from './providers/Base'
import { WalletLinkProvider } from './providers/WalletLink'
import { Coin98Provider } from './providers/Coin98'
import { MathWalletProvider } from './providers/MathWallet'
import FortmaticProvider from './providers/Fortmatic'
import TorusProvider from './providers/Torus'

/**
 * Register all supported providers
 */
export const Providers: Record<ProviderType, BaseProvider> = {
    [ProviderType.MaskWallet]: new MaskWalletProvider(),
    [ProviderType.MetaMask]: new MetaMaskProvider(),
    [ProviderType.WalletConnect]: new WalletConnectProvider(),
    [ProviderType.Coin98]: new Coin98Provider(),
    [ProviderType.WalletLink]: new WalletLinkProvider(),
    [ProviderType.MathWallet]: new MathWalletProvider(),
    [ProviderType.Fortmatic]: new FortmaticProvider(),
    [ProviderType.Torus]: new TorusProvider(),
    [ProviderType.CustomNetwork]: new CustomNetworkProvider(),
}
