'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 */

import { Application, Value, Service } from 'bpframework'

@Service()
class DemoService {
  @Value('Miss A')
  teacher1Name: string // will set to 'Miss A'

  @Value('${teachers[0]}')
  teacherMissA: string // will set to config value "teachers[0]"; The value will auto refreshed when remote config changed.
  
  @Value('${teachers[1]}')
  teacherMissB: string // will set to config value "teachers[1]"

  @Value('${teachers[2].Mr}')
  teacherMr: string // will set to config value "teachers[2].Mr"

  @Value('${teachers[3]:defaultTeacher}')
  teacherDefaultValue: string // will set to 'defaultTeacher' if config value "teachers[3]" isn't existed.

  @Value('${student.a.b}')
  studentA_b: number // will set to config value "student.a.b"

  constructor() {
    setTimeout(() => {
      console.log(this.teacher1Name);
      console.log(this.teacherMissA);
      console.log(this.teacherMissB);
      console.log(this.teacherMr);
      console.log(this.teacherDefaultValue);
      console.log(this.studentA_b);

      console.assert(Application.getConfig()['teachers[0]'] === this.teacherMissA);
      console.assert(Application.getConfig()['student'].a.b === this.studentA_b);
      console.assert(Application.getConfig()['student'].a.b === Application.getConfig()['student.a.b']);
      
      let teachers = Application.getConfig()['teachers'];
      console.log(teachers[0]);
      console.log(teachers[1]);
      console.log(teachers[2]);
    }, 5000);
  }
}
