'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (Pokja variant — 5-column table)
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 40,
    paddingLeft: 55,
    paddingRight: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
  },
  // ── KOP SURAT (Di Sebelah Kiri) ─────────────────────────────────────────────
  kopContainer: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  kopText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  kopTextBold: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerText: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  headerTextBold: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  dividerLine: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  logoTribrata: {
    width: 48,
    height: 46,
    objectFit: 'contain',
  },
  // ── TITLE ──────────────────────────────────────────────────────────────────
  titleContainer: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 2,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  // ── ROW SECTIONS ───────────────────────────────────────────────────────────
  rowSection: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  labelColumn: {
    width: 88,
  },
  colonColumn: {
    width: 12,
  },
  contentColumn: {
    flex: 1,
    textAlign: 'justify',
  },
  centerTextBold: {
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 8,
    fontSize: 10,
    textTransform: 'uppercase',
    textDecoration: 'underline',
  },
  // ── LISTS ──────────────────────────────────────────────────────────────────
  listRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  listNum: {
    width: 16,
  },
  listText: {
    flex: 1,
    textAlign: 'justify',
  },
  // ── SIGNATURE SECTION ──────────────────────────────────────────────────────
  signatureSection: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  parafBox: {
    width: 195,
    fontSize: 8.5,
  },
  parafTitle: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    marginBottom: 3,
    fontSize: 8.5,
  },
  parafRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  parafLabel: {
    width: 130,
  },
  parafDots: {
    flex: 1,
  },
  ttdBox: {
    width: 230,
  },
  ttdPlace: {
    fontSize: 10,
    marginBottom: 1,
  },
  ttdTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  ttdNameSpace: {
    height: 50,
  },
  ttdName: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
    fontSize: 10,
    textAlign: 'center',
  },
  ttdRank: {
    fontSize: 10,
    textAlign: 'center',
  },
  // ── LAMPIRAN ───────────────────────────────────────────────────────────────
  lampiranHeaderRight: {
    alignSelf: 'flex-end',
    fontSize: 8.5,
    marginBottom: 10,
  },
  // ── TABLE (Pokja 5-column) ──────────────────────────────────────────────────
  table: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 22,
    alignItems: 'center',
  },
  tableLastRow: {
    flexDirection: 'row',
    minHeight: 22,
    alignItems: 'center',
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textAlign: 'center',
    padding: 3,
  },
  tableCell: {
    fontSize: 8,
    padding: 3,
    alignSelf: 'stretch',
    paddingTop: 4,
  },
  // 5 columns for Pokja
  colNo: {
    width: '6%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    textAlign: 'center',
  },
  colNama: {
    width: '26%',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  colPangkat: {
    width: '22%',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  colJabatanKesatuan: {
    width: '26%',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  colJabatanPokja: {
    width: '20%',
    textAlign: 'center',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const KopSurat = () => (
  <View style={styles.kopContainer}>
    <Text style={styles.kopText}>MARKAS BESAR</Text>
    <Text style={styles.kopTextBold}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</Text>
    <Text style={styles.kopTextBold}>PUSAT PENELITIAN DAN PENGEMBANGAN</Text>
  </View>
);

const TTDBlock = ({
  tanggalDikeluarkan,
  pejabatJabatan,
  pejabatNama,
  pejabatPangkat,
}: {
  tanggalDikeluarkan: string;
  pejabatJabatan?: string;
  pejabatNama: string;
  pejabatPangkat: string;
}) => (
  <View style={styles.ttdBox}>
    <Text style={styles.ttdPlace}>Dikeluarkan di : Bogor</Text>
    <Text style={styles.ttdPlace}>pada tanggal : {tanggalDikeluarkan}</Text>
    <Text style={styles.ttdTitle}>
      {(pejabatJabatan || 'KEPALA PUSAT PENELITIAN DAN PENGEMBANGAN POLRI').toUpperCase()}
    </Text>
    <View style={styles.ttdNameSpace} />
    <Text style={styles.ttdName}>{pejabatNama}</Text>
    <Text style={styles.ttdRank}>{pejabatPangkat}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface PokjaPersonelData {
  no: number;
  nama: string;
  pangkatNrp: string;
  jabatanKesatuan: string;
  jabatanPokja: string; // e.g. PENANGGUNG JAWAB, KETUA, ANGGOTA
}

export interface SprinPokjaProps {
  sprinNumber: string;
  namaPokja: string;
  pertimbangan: string;
  dasarList: string[];
  untukList: string[];
  tanggalDikeluarkan: string;
  pejabatJabatan?: string;
  pejabatNama: string;
  pejabatPangkat: string;
  personelList: PokjaPersonelData[];
  qrCodeUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SPRIN POKJA DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────
export const SprinPokjaDocument: React.FC<SprinPokjaProps> = ({
  sprinNumber,
  namaPokja,
  pertimbangan,
  dasarList,
  untukList,
  tanggalDikeluarkan,
  pejabatJabatan,
  pejabatNama,
  pejabatPangkat,
  personelList,
  qrCodeUrl,
}) => (
  <Document>
    {/* ═══════════════════════════════════════════════════════════════
        PAGE 1: SURAT PERINTAH UTAMA
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.page}>
      {/* Kop Surat di Sebelah Kiri */}
      <KopSurat />

      {/* Logo Tribrata di Tengah (Ukuran Sesuai Dokumen Resmi) */}
      <View style={styles.logoContainer}>
        <Image style={styles.logoTribrata} src="/logo-tribrata.png" />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>SURAT PERINTAH</Text>
        <Text style={styles.subtitle}>Nomor : Sprin/ {sprinNumber}</Text>
      </View>

      {/* Pertimbangan */}
      <View style={styles.rowSection}>
        <Text style={styles.labelColumn}>Pertimbangan</Text>
        <Text style={styles.colonColumn}>:</Text>
        <Text style={styles.contentColumn}>{pertimbangan}</Text>
      </View>

      {/* Dasar */}
      <View style={styles.rowSection}>
        <Text style={styles.labelColumn}>Dasar</Text>
        <Text style={styles.colonColumn}>:</Text>
        <View style={styles.contentColumn}>
          {dasarList.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text style={styles.listNum}>{index + 1}.</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* DIPERINTAHKAN */}
      <Text style={styles.centerTextBold}>DIPERINTAHKAN</Text>

      {/* Kepada */}
      <View style={styles.rowSection}>
        <Text style={styles.labelColumn}>Kepada</Text>
        <Text style={styles.colonColumn}>:</Text>
        <View style={styles.contentColumn}>
          {personelList.length === 0 ? (
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              NAMA, PANGKAT, NRP/NIP, JABATAN DAN KESATUAN SESUAI YANG
              TERCANTUM DALAM LAMPIRAN SURAT PERINTAH INI.
            </Text>
          ) : personelList.length === 1 ? (
            <View style={{ marginBottom: 2 }}>
              <View style={{ flexDirection: 'row', marginBottom: 1.5 }}>
                <Text style={{ width: 100 }}>NAMA</Text>
                <Text style={{ width: 10 }}>:</Text>
                <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold' }}>{personelList[0].nama}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1.5 }}>
                <Text style={{ width: 100 }}>PANGKAT / NRP</Text>
                <Text style={{ width: 10 }}>:</Text>
                <Text style={{ flex: 1 }}>{personelList[0].pangkatNrp}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 1.5 }}>
                <Text style={{ width: 100 }}>JABATAN KESATUAN</Text>
                <Text style={{ width: 10 }}>:</Text>
                <Text style={{ flex: 1 }}>{personelList[0].jabatanKesatuan}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ width: 100 }}>JABATAN POKJA</Text>
                <Text style={{ width: 10 }}>:</Text>
                <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold' }}>{personelList[0].jabatanPokja}</Text>
              </View>
            </View>
          ) : personelList.length <= 3 ? (
            personelList.map((p, idx) => (
              <View key={idx} style={{ marginBottom: 4, flexDirection: 'row' }}>
                <Text style={{ width: 14 }}>{idx + 1}.</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                    <Text style={{ width: 95 }}>NAMA</Text>
                    <Text style={{ width: 8 }}>:</Text>
                    <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold' }}>{p.nama}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                    <Text style={{ width: 95 }}>PANGKAT / NRP</Text>
                    <Text style={{ width: 8 }}>:</Text>
                    <Text style={{ flex: 1 }}>{p.pangkatNrp}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginBottom: 1 }}>
                    <Text style={{ width: 95 }}>JABATAN</Text>
                    <Text style={{ width: 8 }}>:</Text>
                    <Text style={{ flex: 1 }}>{p.jabatanKesatuan}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ width: 95 }}>DLM POKJA</Text>
                    <Text style={{ width: 8 }}>:</Text>
                    <Text style={{ flex: 1, fontFamily: 'Helvetica-Bold' }}>{p.jabatanPokja}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View>
              {personelList.map((p, idx) => (
                <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                  <Text style={{ width: 14 }}>{idx + 1}.</Text>
                  <Text style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{p.nama}</Text> ({p.pangkatNrp}) - {p.jabatanPokja}
                  </Text>
                </View>
              ))}
              <Text style={{ fontSize: 8, fontStyle: 'italic', marginTop: 2, color: '#444' }}>
                *Susunan lengkap Tim Pokja tercantum dalam Lampiran Surat Perintah ini.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Untuk */}
      <View style={styles.rowSection}>
        <Text style={styles.labelColumn}>Untuk</Text>
        <Text style={styles.colonColumn}>:</Text>
        <View style={styles.contentColumn}>
          {untukList.map((item, index) => (
            <View key={index} style={styles.listRow}>
              <Text style={styles.listNum}>{index + 1}.</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={{ marginTop: 8, marginBottom: 16 }}>Selesai.</Text>

      {/* Signatures */}
      <View style={[styles.signatureSection, { justifyContent: qrCodeUrl ? 'space-between' : 'flex-end' }]}>
        {qrCodeUrl && (
          <View style={{ alignSelf: 'flex-end', marginBottom: 4 }}>
            <Image src={qrCodeUrl} style={{ width: 50, height: 50 }} />
            <Text style={{ fontSize: 6, marginTop: 2, color: '#555' }}>
              Verifikasi Keaslian Dokumen
            </Text>
          </View>
        )}

        {/* Right: TTD */}
        <TTDBlock
          tanggalDikeluarkan={tanggalDikeluarkan}
          pejabatJabatan={pejabatJabatan}
          pejabatNama={pejabatNama}
          pejabatPangkat={pejabatPangkat}
        />
      </View>
    </Page>

    {/* ═══════════════════════════════════════════════════════════════
        PAGE 2: LAMPIRAN SUSUNAN TIM POKJA
    ═══════════════════════════════════════════════════════════════ */}
    <Page size="A4" style={styles.page}>
      {/* Lampiran header (top-right) */}
      <View style={styles.lampiranHeaderRight}>
        <Text>LAMPIRAN SURAT PERINTAH {(pejabatJabatan || 'KAPUSLITBANG POLRI').toUpperCase()}</Text>
        <Text>NOMOR  : SPRIN/ {sprinNumber}</Text>
        <Text>TANGGAL: {tanggalDikeluarkan}</Text>
      </View>

      {/* Kop mini */}
      <View style={{ alignItems: 'center', marginBottom: 6 }}>
        <Text style={styles.headerText}>MARKAS BESAR</Text>
        <Text style={styles.headerTextBold}>KEPOLISIAN NEGARA REPUBLIK INDONESIA</Text>
        <Text style={styles.headerTextBold}>PUSAT PENELITIAN DAN PENGEMBANGAN</Text>
        <View style={[styles.dividerLine, { width: '100%' }]} />
      </View>

      {/* Lampiran title */}
      <Text style={[styles.centerTextBold, { fontSize: 9 }]}>
        DAFTAR SUSUNAN TIM POKJA {namaPokja.toUpperCase()}
      </Text>

      {/* Pokja Table — 5 Columns */}
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.tableRow, { backgroundColor: '#d9d9d9' }]}>
          <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
          <Text style={[styles.tableHeaderCell, styles.colNama]}>NAMA</Text>
          <Text style={[styles.tableHeaderCell, styles.colPangkat]}>PANGKAT / NRP / NIP</Text>
          <Text style={[styles.tableHeaderCell, styles.colJabatanKesatuan]}>
            JABATAN DALAM KESATUAN
          </Text>
          <Text style={[styles.tableHeaderCell, styles.colJabatanPokja]}>
            JABATAN DALAM POKJA
          </Text>
        </View>

        {/* Sub-header numbers */}
        <View style={[styles.tableRow, { backgroundColor: '#efefef' }]}>
          <Text style={[styles.tableHeaderCell, styles.colNo]}>1</Text>
          <Text style={[styles.tableHeaderCell, styles.colNama]}>2</Text>
          <Text style={[styles.tableHeaderCell, styles.colPangkat]}>3</Text>
          <Text style={[styles.tableHeaderCell, styles.colJabatanKesatuan]}>4</Text>
          <Text style={[styles.tableHeaderCell, styles.colJabatanPokja]}>5</Text>
        </View>

        {/* Data rows */}
        {personelList.map((item, idx) => {
          const isLast = idx === personelList.length - 1;
          return (
            <View key={idx} style={isLast ? styles.tableLastRow : styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo, { textAlign: 'center' }]}>
                {item.no}.
              </Text>
              <Text style={[styles.tableCell, styles.colNama, { fontFamily: 'Helvetica-Bold' }]}>
                {item.nama}
              </Text>
              <Text style={[styles.tableCell, styles.colPangkat]}>{item.pangkatNrp}</Text>
              <Text style={[styles.tableCell, styles.colJabatanKesatuan]}>
                {item.jabatanKesatuan}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colJabatanPokja,
                  { fontFamily: 'Helvetica-Bold', textAlign: 'center' },
                ]}
              >
                {item.jabatanPokja}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Signatures lampiran */}
      <View style={[styles.signatureSection, { justifyContent: 'flex-end' }]}>
        <TTDBlock
          tanggalDikeluarkan={tanggalDikeluarkan}
          pejabatJabatan={pejabatJabatan}
          pejabatNama={pejabatNama}
          pejabatPangkat={pejabatPangkat}
        />
      </View>
    </Page>
  </Document>
);
