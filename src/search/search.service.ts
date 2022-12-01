import { Injectable } from '@nestjs/common';
//import { InjectDataSource } from '@nestjs/typeorm';
// import dataSource from 'src/config/datasource';
import { ConnectionService } from 'src/connection/connection.service';

@Injectable()
export class SearchService {
  constructor(
    // @InjectDataSource(dataSource)
    // private datasource,

    private connectionService: ConnectionService
  ) {}

  async getAll(
    division: number,
    address: number,
    language: number,
    priority: number,
  )//: Promise<[]> 
  {
    const divisions = [
      'Naes',
      'Woes',
      'Binyos',
      'Sanbus',
      'Seonghyeongs',
      'Soas',
      'Singyeongs',
      'Ans',
      'Ibinhus',
      'Jaehwals',
      'Jeongsins',
      'Jeonghyeongs',
      'Chis',
      'Pibus',
      'Yaks',
      'Hanbangs',
      'Emergencies',
    ];

    const addressArray = [
      '강남구',
      '강동구',
      '강북구',
      '강서구',
      '관악구',
      '광진구',
      '구로구',
      '금천구',
      '노원구',
      '도봉구',
      '동대문구',
      '동작구',
      '마포구',
      '서대문구',
      '서초구',
      '성동구',
      '성북구',
      '송파구',
      '양천구',
      '영등포구',
      '용산구',
      '은평구',
      '종로구',
      '중구',
      '중랑구',
    ];

    const part = divisions[Number(division)];
    const province = addressArray[Number(address)];
    const today = new Date()
    //const dayName = today.toDateString().toLowerCase().split(" ")[0];
    //const timeNow = today.toTimeString().toLowerCase().split(":")[0];
    const dayName = 'mon'
    const timeNow = 24

    /**
     * 위치우선 : 위치와 시간조건으로 검색합니다.
     * 해당 시간에 운영중인 병원이 없으면 (새벽의 경우) 그 구역의 응급실 운영 병원을 검색합니다.
     */
    switch(priority) {
      case 1:
      //인덱스를 타지 않는 쿼리
      // const hospitals = await this.datasource.manager.query(`SELECT * FROM ` + part + ` WHERE address Like ? AND ` + dayName + ` IS NOT NULL AND SUBSTRING_INDEX(`+dayName+`, ':', 1) < ? `,
      // [ `%${province}%`, timeNow ])

      //풀텍스트 인덱스를 타는 쿼리 
      const [hospitals, fields] = await this.connectionService.connection.query(
        `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM ` + part + ` WHERE MATCH(address) AGAINST(?) AND ` + dayName + ` IS NOT NULL AND (? BETWEEN SUBSTRING_INDEX(`+dayName+`, ':', 1) AND (SUBSTRING(`+dayName+`, 7, 2) + 1)) `, 
        [province, timeNow],
      );

      if (Array.isArray(hospitals) && hospitals.length !== 0) {
        return hospitals;

      } else if (Array.isArray(hospitals) && hospitals.length === 0) {
        const [hospitals, fields] = await this.connectionService.connection.query(
          `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM Emergencies WHERE MATCH(address) AGAINST(?)`,
          [province],
        );
        // const hospitals = await this.datasource.manager.query(
        //   `SELECT * FROM Emergencies WHERE address Like ?`,
        //   [`%${province}%`],
        // );
        return hospitals;
      }
    }

    /**
     * 언어우선 : 언어와 위치 조건으로 검색합니다.
     * 해당 구역에 해당 언어로 진료하는 병원이 없으면, 서울시로 넓혀 검색합니다.
     * 그래도 해당 언어로 진료하는 병원이 없으면, 영어진료가 가능한 병원으로 응답합니다.
     */
    switch (priority) {
      case 2:
        
      const [hospitals, fields] = await this.connectionService.connection.query(
        `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM ` + part + ` WHERE ((MATCH(address) AGAINST(?)) AND SUBSTRING(foreignLanguages, ?, 1) LIKE 1)`,
        [ province, Number(language) ]
      );
      // const hospitals = await this.datasource.manager.query(
      //   `SELECT * FROM ` + part + ` WHERE ((address Like ?) AND SUBSTRING(foreignLanguages, ?, 1) LIKE 1)`,
      //   [ `%${province}%`, Number(language) ]
      // );

      if (Array.isArray(hospitals) && hospitals.length !== 0) {
        return hospitals;

      } else if (Array.isArray(hospitals) && hospitals.length === 0) {
        const [hospitals, fields] = await this.connectionService.connection.query(
          `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM ` + part + ` WHERE SUBSTRING(foreignLanguages, ?, 1) LIKE 1`,
          [ Number(language) ]
        );

        if (Array.isArray(hospitals) && hospitals.length !== 0) {
          return hospitals;

        } else if (Array.isArray(hospitals) && hospitals.length === 0) {
          const [hospitals, fields] = await this.connectionService.connection.query(
            `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM ` + part + ` WHERE ((MATCH(address) AGAINST(?)) AND SUBSTRING(foreignLanguages, 1, 1) LIKE 1)`,
            [ province ]
          );
          // const hospitals = await this.datasource.manager.query(
          //   `SELECT * FROM ` + part + ` WHERE ((address Like ?) AND SUBSTRING(foreignLanguages, 1, 1) LIKE 1)`,
          //   [ `%${province}%` ]
          // );
          return hospitals;
        }
      }
    }

    /**
     * 응급실 우선
     * 해당 지역의 응급실 운영 병원을 불러옵니다.
     */
    switch (priority) {
      case 3:

      const [hospitals, fields] = await this.connectionService.connection.query(
        `SELECT hospitalName, hospitalSize, phoneNumber, address, mon, tue, wed, thu, fri, sat, sun, holiday, foreignLanguages FROM Emergencies WHERE MATCH(address) AGAINST(?)`,
        [ province ]
      );
      return hospitals;
      // const hospitals = await this.datasource.manager.query(
      //   `SELECT * FROM Emergencies WHERE address Like ?`,
      //   [ `%${province}%` ]
      // );
      //return hospitals;
    }
  }


}
