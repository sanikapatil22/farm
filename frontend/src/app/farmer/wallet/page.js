'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FarmerLayout from '@/components/farmer/FarmerLayout';
import { ExternalLink, RefreshCw, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SEPOLIA_CHAIN_ID = '0xaa36a7';

const getEthereum = () => {
    if (typeof window === 'undefined') return null;
    return window.ethereum || null;
};

const shortAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function WalletPage() {
    const { t } = useTranslation();
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [chainId, setChainId] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const isConnected = !!walletAddress;
    const isOnSepolia = chainId === SEPOLIA_CHAIN_ID;

    const networkLabel = useMemo(() => {
        if (!chainId) return t('not_connected');
        if (chainId === SEPOLIA_CHAIN_ID) return 'Sepolia';
        return `Unknown (${chainId})`;
    }, [chainId, t]);

    const refreshWalletState = useCallback(async () => {
        const ethereum = getEthereum();
        if (!ethereum) {
            setIsMetaMaskInstalled(false);
            setWalletAddress('');
            setChainId('');
            return;
        }

        setIsMetaMaskInstalled(true);

        try {
            const [accounts, activeChainId] = await Promise.all([
                ethereum.request({ method: 'eth_accounts' }),
                ethereum.request({ method: 'eth_chainId' }),
            ]);

            const address = accounts?.[0] || '';
            setWalletAddress(address);
            setChainId(activeChainId || '');

            if (address) {
                localStorage.setItem('farmchain_wallet_address', address);
            } else {
                localStorage.removeItem('farmchain_wallet_address');
            }
            if (activeChainId) {
                localStorage.setItem('farmchain_wallet_chain_id', activeChainId);
            }
        } catch (err) {
            setError(err?.message || t('wallet_read_error', 'Unable to read wallet state'));
        }
    }, [t]);

    useEffect(() => {
        refreshWalletState();

        const ethereum = getEthereum();
        if (!ethereum) return;

        const handleAccountsChanged = (accounts) => {
            const address = accounts?.[0] || '';
            setWalletAddress(address);
            if (address) {
                localStorage.setItem('farmchain_wallet_address', address);
            } else {
                localStorage.removeItem('farmchain_wallet_address');
            }
        };

        const handleChainChanged = (nextChainId) => {
            setChainId(nextChainId || '');
            if (nextChainId) {
                localStorage.setItem('farmchain_wallet_chain_id', nextChainId);
            }
        };

        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);

        return () => {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
            ethereum.removeListener('chainChanged', handleChainChanged);
        };
    }, [refreshWalletState]);

    const connectWallet = async () => {
        const ethereum = getEthereum();
        if (!ethereum) {
            setError(t('metamask_not_installed', 'MetaMask is not installed.'));
            return;
        }

        setBusy(true);
        setError('');
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const activeChainId = await ethereum.request({ method: 'eth_chainId' });
            const address = accounts?.[0] || '';
            setWalletAddress(address);
            setChainId(activeChainId || '');
            if (address) {
                localStorage.setItem('farmchain_wallet_address', address);
            }
            if (activeChainId) {
                localStorage.setItem('farmchain_wallet_chain_id', activeChainId);
            }
        } catch (err) {
            setError(err?.message || t('wallet_rejected', 'Wallet connection was rejected'));
        } finally {
            setBusy(false);
        }
    };

    const switchToSepolia = async () => {
        const ethereum = getEthereum();
        if (!ethereum) {
            setError(t('metamask_not_installed', 'MetaMask is not installed.'));
            return;
        }

        setBusy(true);
        setError('');
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: SEPOLIA_CHAIN_ID }],
            });
            await refreshWalletState();
        } catch (err) {
            if (err?.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia',
                                nativeCurrency: {
                                    name: 'Sepolia ETH',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://rpc.sepolia.org'],
                                blockExplorerUrls: ['https://sepolia.etherscan.io'],
                            },
                        ],
                    });
                    await refreshWalletState();
                } catch (addErr) {
                    setError(addErr?.message || t('sepolia_add_error', 'Could not add Sepolia network'));
                }
            } else {
                setError(err?.message || t('network_switch_error', 'Could not switch network'));
            }
        } finally {
            setBusy(false);
        }
    };

    const disconnectSession = () => {
        setWalletAddress('');
        setChainId('');
        localStorage.removeItem('farmchain_wallet_address');
        localStorage.removeItem('farmchain_wallet_chain_id');
    };

    return (
        <FarmerLayout>
            <div className="max-w-3xl mx-auto py-10">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="text-center mb-8">
                        <Wallet className="w-16 h-16 text-green-600 mx-auto mb-4" strokeWidth={1.5} />
                        <h1 className="text-3xl font-bold text-stone-800 mb-2">{t('blockchain_wallet')}</h1>
                        <p className="text-stone-600">{t('connect_wallet_help')}</p>
                    </div>

                    <div className="grid gap-4 mb-6">
                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{t('metamask')}</p>
                            <p className={`font-semibold ${isMetaMaskInstalled ? 'text-emerald-700' : 'text-red-600'}`}>
                                {isMetaMaskInstalled ? t('installed') : t('not_detected')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{t('wallet_address')}</p>
                            <p className="font-semibold text-slate-900">
                                {isConnected ? shortAddress(walletAddress) : t('not_connected')}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                            <p className="text-xs uppercase tracking-wide text-slate-500">{t('network')}</p>
                            <p className={`font-semibold ${isOnSepolia ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {networkLabel}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={connectWallet}
                            disabled={busy || !isMetaMaskInstalled}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {busy ? t('please_wait') : isConnected ? t('reconnect_wallet') : t('connect_wallet')}
                        </button>

                        <button
                            onClick={switchToSepolia}
                            disabled={busy || !isConnected}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                        >
                            {t('switch_to_sepolia')}
                        </button>

                        <button
                            onClick={refreshWalletState}
                            disabled={busy}
                            className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            {t('refresh')}
                        </button>

                        <button
                            onClick={disconnectSession}
                            disabled={busy || !isConnected}
                            className="px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-semibold hover:bg-red-50 disabled:opacity-50"
                        >
                            {t('disconnect_session')}
                        </button>

                        {isConnected && (
                            <a
                                href={`https://sepolia.etherscan.io/address/${walletAddress}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 inline-flex items-center gap-2"
                            >
                                {t('view_on_explorer')}
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </FarmerLayout>
    );
}
