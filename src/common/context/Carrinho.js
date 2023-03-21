import { createContext, useContext, useEffect, useState } from "react";
import { usePagamentoContext } from "./Pagamento";
import { UsuarioContext } from "./Usuario";

export const CarrinhoContext = createContext();
CarrinhoContext.displayName = "Carrinho";

export const CarrinhoProvider = ({ children }) => {
    const [carrinho, setCarrinho] = useState([]);
    const [quantidadeProdutos, setQuantidadeProdutos] = useState(0);
    const [valorTotal, setValorTotal] = useState(0);

    return (
        <CarrinhoContext.Provider value={{ carrinho, setCarrinho, quantidadeProdutos, setQuantidadeProdutos, valorTotal, setValorTotal }}>
            {children}
        </CarrinhoContext.Provider>
    )
}

export const useCarrinhoContext = () => {
    const { carrinho, setCarrinho, quantidadeProdutos, setQuantidadeProdutos, valorTotal, setValorTotal } = useContext(CarrinhoContext);
    const { formaPagamento } = usePagamentoContext();
    const {setSaldo} = useContext(UsuarioContext);

    function atualizaQuantidade(id, quantidade) {
        return carrinho.map(item => {
            if (item.id === id) item.quantidade += quantidade;
            return item
        })
    }

    function adicionarProduto(novoProduto) {
        const temProduto = carrinho.some(itemDoCarrinho => itemDoCarrinho.id === novoProduto.id);
        if (!temProduto) {
            novoProduto.quantidade = 1;
            return setCarrinho(carrinhoAnterior => [...carrinhoAnterior, novoProduto]);
        }

        setCarrinho(atualizaQuantidade(novoProduto.id, 1));
    }

    function removerProduto(produtoId) {
        const produto = carrinho.find(itemDoCarrinho => itemDoCarrinho.id === produtoId);
        if (produto.quantidade === 1) {
            return setCarrinho(carrinhoAnterior => carrinhoAnterior.filter(itemDoCarrinho => itemDoCarrinho.id !== produtoId));
        }

        setCarrinho(atualizaQuantidade(produtoId, -1));
    }

    function efetuarCopra() {
        setCarrinho([]);
        setSaldo(saldoAtual => saldoAtual - valorTotal);
    }

    useEffect(() => {
        const { valorTotal, totalQuantidadeProdutos } = carrinho.reduce((contador, produto) => ({
            valorTotal: contador.valorTotal + (produto.valor * produto.quantidade),
            totalQuantidadeProdutos: contador.totalQuantidadeProdutos + produto.quantidade
        }), {
            valorTotal: 0,
            totalQuantidadeProdutos: 0
        });
        setQuantidadeProdutos(totalQuantidadeProdutos);
        setValorTotal(valorTotal * formaPagamento.juros);
    }, [carrinho, setQuantidadeProdutos, setValorTotal, formaPagamento])

    return {
        carrinho,
        setCarrinho,
        adicionarProduto,
        removerProduto,
        quantidadeProdutos,
        setQuantidadeProdutos,
        valorTotal,
        efetuarCopra
    }
}