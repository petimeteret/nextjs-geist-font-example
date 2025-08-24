"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  summary: string;
  author?: string;
  publishDate: string;
  category: string;
  source: string;
  url: string;
  imageUrl?: string;
  readingTime?: number;
}

interface Stats {
  totalArticles: number;
  totalSources: number;
  activeSources: number;
  categoryCounts: Record<string, number>;
}

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string>('');

  // Fetch articles
  const fetchArticles = async (page: number = 1, category: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/articles?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setArticles(data.articles);
        setTotalPages(data.pagination.totalPages);
        setCurrentPage(data.pagination.currentPage);
        setError('');
      } else {
        setError(data.error || 'Kunne ikke hente artikler');
      }
    } catch (err) {
      setError('Nettverksfeil ved henting av artikler');
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Refresh articles
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/refresh', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        await fetchArticles(currentPage, selectedCategory);
        await fetchStats();
        alert(`Suksess! Lagt til ${data.articlesAdded} nye artikler.`);
      } else {
        alert(`Oppdatering feilet: ${data.error}`);
      }
    } catch (err) {
      alert('Nettverksfeil under oppdatering');
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    fetchArticles(1, category);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchArticles(page, selectedCategory);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('no-NO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Ukjent dato';
    }
  };

  // Get category display name in Norwegian
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'helse': 'Helse',
      'alternativ_medisin': 'Alternativ Medisin',
      'politikk': 'Politikk',
      'krig': 'Krig & Militær',
      'teknologi': 'Teknologi',
      'økonomi': 'Økonomi',
      'kultur': 'Kultur',
      'medier': 'Medier',
      'klima': 'Klima'
    };
    return categoryMap[category] || category;
  };

  // Handle image error with better fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, category: string) => {
    const target = e.currentTarget;
    if (!target.dataset.fallbackAttempted) {
      target.dataset.fallbackAttempted = 'true';
      target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/e9c2df8f-c37e-4964-b641-53c56348d05e.png))}`;
    } else {
      // Hide the image and show placeholder
      target.style.display = 'none';
      const parent = target.parentElement;
      if (parent && !parent.querySelector('.image-fallback')) {
        const fallback = document.createElement('div');
        fallback.className = 'image-fallback w-full h-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600';
        fallback.innerHTML = `<div class="text-center text-gray-400"><div class="text-lg font-medium">${getCategoryDisplayName(category)}</div><div class="text-sm">Ingen bilde tilgjengelig</div></div>`;
        parent.appendChild(fallback);
      }
    }
  };

  // Initial load
  useEffect(() => {
    fetchArticles();
    fetchStats();
    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <img 
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1618eb25-b5b1-4d58-9a3f-4c5027f6ea37.png" 
          alt="MotStrømsMedia - Mot Strømmen, For Sannheten"
          className="w-full h-48 object-cover rounded-lg mb-6 bg-red-900"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <h1 className="text-4xl font-bold text-white mb-4">
          MotStrømsMedia
        </h1>
        <p className="text-xl text-red-300 mb-2 italic">
          Mot Strømmen - For Sannheten
        </p>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          Uavhengige perspektiver på helsefrihet, alternativ medisin og aktuelle hendelser 
          fra ikke-mainstream kilder verden over.
        </p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-red-800 text-center">
            <div className="text-3xl font-bold text-red-400">{stats.totalArticles}</div>
            <div className="text-sm text-gray-400">Totale Artikler</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-red-800 text-center">
            <div className="text-3xl font-bold text-green-400">{stats.activeSources}</div>
            <div className="text-sm text-gray-400">Aktive Kilder</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-red-800 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {Object.keys(stats.categoryCounts).length}
            </div>
            <div className="text-sm text-gray-400">Kategorier</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-red-800 text-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {refreshing ? 'Oppdaterer...' : 'Oppdater Artikler'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <label className="text-sm font-medium text-gray-300">Filtrer etter kategori:</label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="border border-red-600 bg-gray-800 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Alle Kategorier</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {getCategoryDisplayName(category)}
              </option>
            ))}
          </select>
          {selectedCategory && (
            <button
              onClick={() => handleCategoryChange('')}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Fjern Filter
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-gray-400">Laster artikler...</div>
        </div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-gray-800 border border-red-800 rounded-lg overflow-hidden hover:bg-gray-750 hover:border-red-600 transition-all duration-200"
            >
              {/* Article Image */}
              <div className="relative w-full h-48 sm:h-40 md:h-48">
                {article.imageUrl ? (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover bg-gray-800"
                    onError={(e) => handleImageError(e, article.category)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center border-2 border-dashed border-gray-600">
                    <div className="text-center text-gray-400">
                      <div className="text-lg font-medium">{getCategoryDisplayName(article.category)}</div>
                      <div className="text-sm">Ingen bilde tilgjengelig</div>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="inline-block bg-red-900/80 text-red-300 text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                    {getCategoryDisplayName(article.category)}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className="inline-block bg-gray-900/80 text-gray-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {article.readingTime}min lesing
                  </span>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <h2 className="text-lg font-semibold text-white mb-3 line-clamp-2 leading-tight">
                  <Link 
                    href={`/articles/${article.id}`}
                    className="hover:text-red-400 transition-colors"
                  >
                    {article.title}
                  </Link>
                </h2>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-4 gap-2">
                  <div>
                    <span className="font-medium text-gray-400">{article.source}</span>
                    {article.author && (
                      <span className="ml-2">av {article.author}</span>
                    )}
                  </div>
                  <time className="text-gray-500">{formatDate(article.publishDate)}</time>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    href={`/articles/${article.id}`}
                    className="inline-flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Les Mer
                  </Link>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center border border-red-600 text-red-300 px-4 py-2 rounded-md hover:bg-red-900/30 text-sm font-medium transition-colors"
                  >
                    Original →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* No Articles Message */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {selectedCategory 
              ? `Ingen artikler funnet i kategorien "${getCategoryDisplayName(selectedCategory)}".`
              : 'Ingen artikler tilgjengelig. Prøv å oppdatere for å hente nytt innhold.'
            }
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
          >
            {refreshing ? 'Oppdaterer...' : 'Oppdater Artikler'}
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-red-600 bg-gray-800 rounded-md text-sm font-medium text-gray-300 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Forrige
          </button>
          
          <span className="text-sm text-gray-400">
            Side {currentPage} av {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-red-600 bg-gray-800 rounded-md text-sm font-medium text-gray-300 hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Neste
          </button>
        </div>
      )}
    </div>
  );
}
